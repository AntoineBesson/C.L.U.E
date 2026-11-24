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
- ``openrouter:<model>`` Any OpenRouter model (``OPENROUTER_API_KEY`` or a network secret), with top
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
import threading
import urllib.error
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

    def chat(self, system: str, messages: list[dict], context: dict) -> Reply:
        """A conversation (alternating user/assistant turns, ending on a user turn).
        Single-turn backends only take a one-message conversation."""
        if len(messages) == 1:
            return self.answer(system, messages[0]["content"], context)
        raise NotImplementedError(f"{self.name} does not support multi-turn sets")


class AnthropicBackend(Backend):
    def __init__(self, model: str):
        import anthropic  # optional dependency

        self.name = f"anthropic:{model}"
        self.model = model
        self.client = anthropic.Anthropic()

    def answer(self, system: str, user: str, context: dict) -> Reply:
        return self.chat(system, [{"role": "user", "content": user}], context)

    def chat(self, system: str, messages: list[dict], context: dict) -> Reply:
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
            messages=messages,
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
        # The key can come from OPENROUTER_API_KEY, or be added to requests by the
        # environment's network secret for openrouter.ai, in which case the
        # harness never sees it.
        self.key = os.environ.get("OPENROUTER_API_KEY")

        # Reasoning off where the model allows it; some models (e.g. Mistral
        # Large 4) refuse that, and then get the lowest effort with the
        # reasoning text left out of the reply.
        self.reasoning: dict = {"enabled": False}
        self.max_tokens = 8
        self.logprobs = True
        self.lock = threading.Lock()

    def _post(self, body: dict) -> dict:
        req = urllib.request.Request(
            self.URL,
            data=json.dumps(body).encode(),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "clue-harness/0.1",
                **({"Authorization": f"Bearer {self.key}"} if self.key else {}),
            },
        )
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.load(r)

    def answer(self, system: str, user: str, context: dict) -> Reply:
        return self.chat(system, [{"role": "user", "content": user}], context)

    def chat(self, system: str, messages: list[dict], context: dict) -> Reply:
        body = {
            "model": self.model,
            "messages": [{"role": "system", "content": system}, *messages],
            "temperature": 1,
        }
        # A crowd guess ("A=40, B=30, C=20, D=10") needs more room than one letter.
        want_tokens = context.get("max_tokens", 8)
        # Learn what the model refuses (logprobs, reasoning off) on the first
        # call, then keep those settings for the rest of the run.
        for _ in range(4):
            sent_logprobs, sent_reasoning = self.logprobs, self.reasoning
            extra = {"max_tokens": max(self.max_tokens, want_tokens), "reasoning": sent_reasoning}
            if sent_logprobs:
                # Route only to providers that return logprobs.
                extra.update(logprobs=True, top_logprobs=10, provider={"require_parameters": True})
            try:
                data = self._post({**body, **extra})
                break
            except urllib.error.HTTPError as e:
                detail = e.read().decode(errors="replace")
                with self.lock:
                    if (sent_logprobs, sent_reasoning) != (self.logprobs, self.reasoning):
                        continue  # another thread already adapted the settings
                    if sent_logprobs and (
                        (e.code == 400 and "logprobs" in detail.lower())
                        or (e.code == 404 and "no endpoints found" in detail.lower())
                    ):
                        self.logprobs = False
                        continue
                    if e.code == 400 and "reasoning" in detail and sent_reasoning.get("enabled") is False:
                        self.reasoning, self.max_tokens = {"effort": "low", "exclude": True}, 2048
                        continue
                e.msg = f"{e.msg}: {detail[:300]}"
                raise
        else:
            raise RuntimeError(f"{self.name}: request kept being refused")
        choice = data["choices"][0]
        text = choice["message"].get("content") or ""
        probs = None
        lp = (choice.get("logprobs") or {}).get("content") or []
        if lp and self.reasoning.get("enabled") is False and not context.get("guess"):
            # First content token's top alternatives; the runner keeps only the
            # letters actually shown and renormalises.
            first: dict[str, float] = {}
            for t in lp[0].get("top_logprobs", []):
                tok = t["token"].strip()
                if tok in ("A", "B", "C", "D"):
                    first[tok] = first.get(tok, 0.0) + math.exp(t["logprob"])
            probs = first or None
        return Reply(text=text, probs=probs, usage=data.get("usage", {}), sampling="logprobs" if probs else "sample")


class MockBackend(Backend):
    """Softmax over how well each option's keys fit the persona's target traits."""

    name = "mock"

    def __init__(self, sharpness: float = 2.0):
        self.sharpness = sharpness

    def chat(self, system: str, messages: list[dict], context: dict) -> Reply:
        if context.get("guess"):
            # Uniform guess pulled toward the mock's own pick (a false-consensus effect).
            order, own = context["order"], context.get("own_key")
            rng = random.Random(f"{context['persona']['persona_id']}|{context['item']['id']}|guess")
            w = [1.0 + (1.0 if k == own else 0.0) + rng.random() * 0.5 for k in order]
            n = [round(100 * x / sum(w)) for x in w]
            n[-1] = 100 - sum(n[:-1])
            return Reply(text=", ".join(f"{'ABCD'[i]}={v}" for i, v in enumerate(n)))
        return self.answer(system, messages[-1]["content"], context)

    def answer(self, system: str, user: str, context: dict) -> Reply:
        item, order, traits = context["item"], context["order"], context["persona"]["target_traits"]
        rng = random.Random(f"{context['persona']['persona_id']}|{item['id']}")
        a = item["answer"]
        if a["type"] == "likert":
            z = traits.get(context["item"]["trait"], 0) * (-1 if context["item"]["reversed"] else 1)
            mid = (a["min"] + a["max"]) / 2
            v = round(mid + z * (a["max"] - a["min"]) / 4 + rng.gauss(0, 0.5))
            return Reply(text=str(max(a["min"], min(a["max"], v))))
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
