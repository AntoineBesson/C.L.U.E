"""Where an AI player's answer comes from.

Every backend takes a system prompt (the persona) and a user prompt (the item)
and returns the raw reply text, plus answer probabilities when the backend can
read them (logprobs). Backends:

- ``anthropic:<model>``  Claude API through the official SDK (``pip install anthropic``,
  ``ANTHROPIC_API_KEY``). Thinking is kept off or at its lowest setting, so one
  item costs a few output tokens.
- ``claude-cli:<model>`` Claude through a headless Claude Code (``claude -p``) with
  tools, MCP servers and settings turned off. Handy for development runs where
  Claude Code is already signed in; use the API for bulk runs.
- ``openrouter:<model>`` Any OpenRouter model (``OPENROUTER_API_KEY``), with top
  logprobs requested where the provider supports them. Not run yet.
- ``mock``                A deterministic fake player that picks the option whose
  keyed traits best fit the persona. For tests and for checking the analysis.
"""

from __future__ import annotations

import json
import math
import os
import random
import subprocess
import urllib.request
from dataclasses import dataclass, field


@dataclass
class Reply:
    text: str
    probs: dict[str, float] | None = None  # letter -> probability, when logprobs exist
    usage: dict = field(default_factory=dict)
    sampling: str = "sample"  # "sample" (one draw at the provider's default) or "logprobs"


class Backend:
    name: str

    def answer(self, system: str, user: str, context: dict) -> Reply:  # pragma: no cover
        raise NotImplementedError


class AnthropicBackend(Backend):
    def __init__(self, model: str):
        import anthropic  # optional dependency

        self.name = f"anthropic:{model}"
        self.model = model
        self.client = anthropic.Anthropic()

    def answer(self, system: str, user: str, context: dict) -> Reply:
        kwargs: dict = {}
        if self.model.startswith("claude-haiku-5"):
            # Haiku 5.5 accepts disabled thinking at effort high or below.
            kwargs["thinking"] = {"type": "disabled"}
        else:
            # Newer Opus/Sonnet models cannot turn thinking off; keep it minimal.
            kwargs["output_config"] = {"effort": "low"}
        msg = self.client.messages.create(
            model=self.model,
            max_tokens=256,
            system=system,
            messages=[{"role": "user", "content": user}],
            **kwargs,
        )
        if msg.stop_reason == "refusal":
            return Reply(text="", usage={"refusal": True})
        text = "".join(b.text for b in msg.content if b.type == "text")
        return Reply(text=text, usage={"input_tokens": msg.usage.input_tokens, "output_tokens": msg.usage.output_tokens})


class ClaudeCliBackend(Backend):
    def __init__(self, model: str, timeout: float = 120):
        self.name = f"claude-cli:{model}"
        self.model = model
        self.timeout = timeout

    def answer(self, system: str, user: str, context: dict) -> Reply:
        cmd = [
            "claude", "-p", user,
            "--model", self.model,
            "--system-prompt", system,
            "--tools", "",
            "--strict-mcp-config",
            "--setting-sources", "",
            "--no-session-persistence",
            "--output-format", "json",
        ]
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=self.timeout, cwd="/tmp")
        if out.returncode != 0:
            raise RuntimeError(f"claude -p failed ({out.returncode}): {out.stderr[-500:] or out.stdout[-500:]}")
        data = json.loads(out.stdout)
        u = data.get("usage", {})
        return Reply(
            text=data.get("result", ""),
            usage={
                "input_tokens": u.get("input_tokens", 0) + u.get("cache_creation_input_tokens", 0) + u.get("cache_read_input_tokens", 0),
                "output_tokens": u.get("output_tokens", 0),
                "cost_usd": data.get("total_cost_usd"),
            },
        )


class OpenRouterBackend(Backend):
    URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self, model: str):
        self.name = f"openrouter:{model}"
        self.model = model
        self.key = os.environ["OPENROUTER_API_KEY"]

    def answer(self, system: str, user: str, context: dict) -> Reply:
        body = {
            "model": self.model,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "max_tokens": 8,
            "temperature": 1,
            "logprobs": True,
            "top_logprobs": 10,
            "reasoning": {"enabled": False},
        }
        req = urllib.request.Request(
            self.URL,
            data=json.dumps(body).encode(),
            headers={"Authorization": f"Bearer {self.key}", "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.load(r)
        choice = data["choices"][0]
        text = choice["message"].get("content") or ""
        probs = None
        lp = (choice.get("logprobs") or {}).get("content") or []
        if lp:
            first = {t["token"].strip(): math.exp(t["logprob"]) for t in lp[0].get("top_logprobs", [])}
            letters = {k: v for k, v in first.items() if k in ("A", "B", "C", "D")}
            if letters:
                s = sum(letters.values())
                probs = {k: v / s for k, v in letters.items()}
        return Reply(text=text, probs=probs, usage=data.get("usage", {}), sampling="logprobs" if probs else "sample")


class MockBackend(Backend):
    """Softmax over how well each option's keys fit the persona's target traits."""

    name = "mock"

    def __init__(self, sharpness: float = 2.0):
        self.sharpness = sharpness

    def answer(self, system: str, user: str, context: dict) -> Reply:
        item, order, traits = context["item"], context["order"], context["persona"]["target_traits"]
        rng = random.Random(f"{context['persona']['persona_id']}|{item['id']}")
        a = item["answer"]
        if a["type"] == "slider":
            score = sum(w * traits.get(t, 0) for t, w in a["keyed"].items())
            return Reply(text=str(max(0, min(100, round(50 + 20 * score + rng.gauss(0, 10))))))
        by_key = {o["key"]: o for o in a["options"]}
        fits = [sum(w * traits.get(t, 0) for t, w in by_key[k]["keyed"].items()) for k in order]
        weights = [math.exp(self.sharpness * f) for f in fits]
        i = rng.choices(range(len(order)), weights=weights)[0]
        return Reply(text="ABCD"[i])


def make_backend(spec: str) -> Backend:
    kind, _, model = spec.partition(":")
    if kind == "mock":
        return MockBackend()
    if kind == "anthropic":
        return AnthropicBackend(model)
    if kind == "claude-cli":
        return ClaudeCliBackend(model)
    if kind == "openrouter":
        return OpenRouterBackend(model)
    raise ValueError(f"unknown backend {spec!r}")
