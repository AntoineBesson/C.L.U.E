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
- **Skip button** on every solo card. Skipped ids are kept on the device (they
  are data too) and the card does not come back.
- **Menu with theme packs** (work, friends, family, money, online, everyday,
  tough calls) or a random mix, each showing how many new cards are left.
- **Private pass-and-play rooms** (2 to 8 players on one phone). Each player
  answers in turn behind a "pass the phone" screen, then guesses either how the
  room answered (database off) or how the database answered (database on).
  Points per card, running totals and final standings. Room answers are not
  saved or sent, since consent covers the phone's owner only.

- **Streaks**: a daily streak (Paris days with a solo answer) on the menu and
  end screen, and a "great reads in a row" badge on the reveal.
- **Words, not only numbers**: several verdicts per score band, one sentence
  on the option the guess missed most, and a summary line for the set.
- **Keyboard shortcuts**: 1-4 or A-D to pick, Enter to validate or lock in,
  S to skip, Y/N on "Are you sure?".
- **Truth bonus is back** for the 25 seed cards where AI players also guessed the
  crowd (sets pilot).

## Quick wins

- **Shorter first session.** 3 cards before the first reveal, so new players
  reach the fun part in under a minute.

## Social and party play

- **Online rooms.** Each friend on their own phone with a room code. Needs
  the server and its consent flow, so after the ethics review.
- **"Guess your friend".** Predict how one specific friend answered. Strong
  hook, but needs consent from both and server storage, so only after the
  ethics review.
- **Share card.** An image of "I read the crowd at 82/100" with no answers on
  it, so sharing reveals nothing personal.

## Depth and replay

- **Crowd slices.** "How did people your age answer?" once real data exists.
  With the simulated crowd, a playful version: "how did the AI split by model?"
  (Qwen vs Mistral differ a lot on some items).
- **Weekly profile reveal.** The trait profile gets sharper with more answers;
  a weekly "your profile now" moment gives a reason to come back and shows
  the research point (how much a few answers reveal).
- **Achievements.** "Contrarian" (picked the rarest answer 5 times), "Mind
  reader" (90+ on a card), "Changed my mind" (reconsidered after "Are you sure?").

## Trust and clarity

- **"Why this question?"** A one-line note after the reveal on what the card
  measures. Fits the project's transparency goal and makes the end profile less
  of a surprise.
- **Data dashboard.** A screen listing exactly what is stored on this device,
  with export and delete, reachable from the top bar, not only the end screen.
- **French version** (planned once the French questionnaires are in).

## Needs a decision first

- Global (server) leaderboard: needs server collection, off until the ethics review.
- Truth bonus on the other 73 cards: only 25 seed cards have AI crowd guesses
  (sets pilot on Qwen, plus the Nemotron grouped check where the wording still
  matches). A grouped guess run (second-turn guesses) over the drafts would
  cover the whole bank on the free quota.