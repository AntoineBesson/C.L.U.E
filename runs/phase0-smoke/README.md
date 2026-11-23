# Phase 0 smoke trial (2026-11-23)

20 personas ([agents/personas.json](../../agents/personas.json)) × the 29
scorable seed items (the free-text item is skipped) × 2 Claude models through
the `claude-cli` backend: 1,160 answers. Full tables in [report.md](report.md),
raw rows in `answers.jsonl`.

## Findings

1. **Choices track the keyed traits, clearly on Sonnet 5.5, weakly on Haiku 5.5.**
   Mean alignment is 0.43 on Sonnet and 0.14 on Haiku, against about 0 when
   personas are shuffled (p < 0.001 for both). Every one of the 20 personas
   tracks on Sonnet; 4 of 20 go negative on Haiku, including the dark-triad
   archetype (-0.14).
2. **Dark-triad proxy fidelity.** The spec's gate asks for r > 0.3 on the SD3
   dimensions against *measured* scores, which need the questionnaires. As a
   proxy against targets: Sonnet passes (Machiavellianism 0.55, narcissism
   0.40, psychopathy 0.35); Haiku does not (0.18, 0.21, 0.09).
3. **No refusals or invalid answers** on either model (0 of 1,160), and none
   needed the stricter retry.
4. **Position bias on Haiku.** It picks the first option shown 14% of the time
   against 32% expected; Sonnet is at 34%. Shuffling per persona and item
   keeps this from biasing which option wins, but it adds noise, and it is the
   check the spec's gate asks for.
5. **Items to revise.** On Sonnet, one option takes over 70% in q0008, q0011,
   q0012, q0018, q0021 and q0027. The obvious "nice" option wins in each:
   asking a struggling colleague if they are okay (q0021), leaving a note
   after scratching a car (q0027), asking politely to take a photo down
   (q0012, where the retaliation option got 0 picks). q0022 (the ex's new
   partner's profile, slider) barely tracks emotionality on either model.
   Conscientiousness and extraversion are the weakest traits overall; their
   options are often the ones that look most reasonable or least reasonable
   regardless of persona.

## Caveats

- Targets stand in for labels. Swap in measured questionnaire scores when the
  scales are in the harness.
- One model family, two sizes. The spec's smoke run wants two families;
  OpenRouter or a Kaggle vLLM backend is next.
- One sample per answer at the default temperature (current Claude models no
  longer take a temperature), so per-item numbers are noisy at n = 20.
- The CLI backend adds about 2,300 input tokens of Claude Code's own per
  call; the API backend will not.
