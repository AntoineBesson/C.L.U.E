# Nemotron 3 Ultra, free tier (partial, 2026-11-23)

Second model family through OpenRouter (`nvidia/nemotron-3-ultra-550b-a55b:free`).
The free tier allows 50 requests a day, so this run stopped after 54 of 1,480
answers (20 personas × 29 dilemmas + 45 questionnaire items). Rerunning the
same command resumes from the cache.

On the first 42 answers (6 personas including the 3 archetypes × 7
dilemmas): no invalid answers, alignment 0.64 against 0.13 with shuffled
personas (p = 0.003; Sonnet 5.5 scores 0.62 and Haiku 5.5 0.22 on the same
cases), the dark-triad persona played without refusals, and first-position
picks at 30% against 35% expected. Too few answers for per-trait or per-item
numbers.
