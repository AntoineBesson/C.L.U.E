# Ideas to make C.L.U.E. better for players

A short brainstorm (2026-11-24), roughly ordered by how much fun each adds for
the effort. Nothing here is built yet unless marked.

## Done in this change

- **No repeated cards.** A card shown on this device never comes back. When the
  bank runs out, the game says so and offers to start over.
- **Reveal after every guess.** The crowd's split appears right after you lock
  in, next to your guess, with your score for that card.
- **Simulated crowd.** Until real players exist, the crowd is 100 AI players
  (50 personas x 2 models), and every screen says so.
- **Local leaderboard**, ranked by average points per guess, with Clu (always
  guessing an even split) as a benchmark to beat.

## Quick wins

1. **Streaks and a daily habit.** "3 days in a row" counter and a gentle "today's
   set is ready" card. The spec already plans daily sets; a streak makes them stick.
2. **Score feedback in words, not only numbers.** "You overestimated how many
   would lie by 20 points" teaches the player something about people.
3. **Skip button.** Some dilemmas hit too close to home. A skip (counted as
   data on its own) is kinder than a forced answer, and is good research practice.
4. **Shorter first session.** 3 cards before the first reveal, so new players
   reach the fun part in under a minute.
5. **Card counter on the home screen.** "48 dilemmas left" shows there is more to
   come and pairs with the no-repeat rule.
6. **Keyboard shortcuts** (1-4 to pick, Enter to validate) for desktop players.

## Social and party play

7. **Pass-and-play party mode.** Several friends on one phone: each answers,
   then everyone guesses how the group split. The local leaderboard already
   supports several names on one device.
8. **"Guess your friend".** Predict how one specific friend answered. Strong
   hook, but needs consent from both and server storage, so only after the
   ethics review.
9. **Share card.** An image of "I read the crowd at 82/100" with no answers on
   it, so sharing reveals nothing personal.

## Depth and replay

10. **Crowd slices.** "How did people your age answer?" once real data exists.
    With the simulated crowd, a playful version: "how did the AI split by model?"
    (Qwen vs Mistral differ a lot on some items).
11. **Themed packs** (work, family, money, online) that players can choose, so
    the bank feels like a collection rather than a stream.
12. **Weekly profile reveal.** The trait profile gets sharper with more answers;
    a weekly "your profile now" moment gives a reason to come back and shows
    the research point (how much a few answers reveal).
13. **Achievements.** "Contrarian" (picked the rarest answer 5 times), "Mind
    reader" (90+ on a card), "Changed my mind" (reconsidered after "Are you sure?").

## Trust and clarity

14. **"Why this question?"** A one-line note after the reveal on what the card
    measures. Fits the project's transparency goal and makes the end profile less
    of a surprise.
15. **Data dashboard.** A screen listing exactly what is stored on this device,
    with export and delete, reachable from the top bar, not only the end screen.
16. **French version** (planned once the French questionnaires are in).

## Needs a decision first

- Global (server) leaderboard: needs server collection, off until the ethics review.
- Truth bonus with the simulated crowd: AI players did not guess the crowd, so
  the bonus is off. The harness could ask each agent to predict the split too,
  which would bring the bonus back before real players arrive (about one extra
  call per agent and item).
