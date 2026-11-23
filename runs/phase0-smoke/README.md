# Phase 0 smoke trial (2026-11-23)

20 personas ([agents/personas.json](../../agents/personas.json)) × the 29
scorable seed items (the free-text item is skipped) × 2 Claude models through
the `claude-cli` backend: 1,160 answers. Full tables in [report.md](report.md),
raw rows in `answers.jsonl`.

## Findings

1. **Choices track the keyed traits, clearly on Sonnet 5.5, weakly on Haiku 5.5.**
   Mean alignment is 0.44 on Sonnet and 0.16 on Haiku, against about 0 when
   personas are shuffled (p < 0.001 for both). Every one of the 20 personas
   tracks on Sonnet; 3 of 20 go slightly negative on Haiku, and Haiku barely
   plays the dark-triad archetype (+0.02, against +0.64 on Sonnet).
2. **Dark-triad proxy fidelity.** The spec's gate asks for r > 0.3 on the SD3
   dimensions against *measured* scores, which need the questionnaires. As a
   proxy against targets: Sonnet passes (Machiavellianism 0.56, narcissism
   0.47, psychopathy 0.45); Haiku does not (0.12, 0.24, -0.05).
3. **No refusals or invalid answers** on either model (0 of 1,160), and none
   needed the stricter retry.
4. **Position bias on Haiku.** It picks the first option shown 15% of the time
   against 32% expected; Sonnet is at 32%. Shuffling per persona and item
   keeps this from biasing which option wins, but it adds noise, and it is one
   of the spec's gate checks.
5. **Per-item flags are not stable at n = 20.** A first run on an earlier
   draw of the same 20-persona design flagged q0008, q0011, q0012, q0018,
   q0021 and q0027 on Sonnet (one option over 70%); this run flags q0005
   (75%) and q0020 (85%) instead, and q0030 does not track its keys
   (alignment -0.13). The overall numbers above barely moved between the two
   runs (alignment 0.43 → 0.44 on Sonnet, 0.14 → 0.16 on Haiku). Item
   pruning needs the 100-agent pre-run the spec plans for Phase 1, not this
   smoke test. Recurring suspects on both runs: options that are the obvious
   "nice" answer (q0012, q0021 on Haiku), and q0022 (the ex's new partner,
   slider), which tracks emotionality only weakly.

6. **Against measured scores** (MFQ-2 and OUS, see
   [../phase0-scales](../phase0-scales/README.md)): labelling each agent with
   its own questionnaire scores instead of its targets leaves Sonnet's
   tracking about the same or slightly higher (impartial beneficence 0.57 →
   0.66, care 0.31 → 0.51, purity 0.36 → 0.47). On Haiku it drops on several
   traits (instrumental harm 0.42 → 0.14, authority 0.31 → 0.07), in line with
   its compressed questionnaire answers.

## Caveats

- Measured labels exist only for the eight MFQ-2 and OUS traits; the other
  nine still use targets.
- One model family, two sizes. The spec's smoke run wants two families;
  OpenRouter or a Kaggle vLLM backend is next.
- One sample per answer at the default temperature (current Claude models no
  longer take a temperature), so per-item numbers are noisy at n = 20.
- The CLI backend adds about 2,300 input tokens of Claude Code's own per
  call; the API backend will not.
