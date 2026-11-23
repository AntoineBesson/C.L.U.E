# Validated scales

The trait labels come from four validated questionnaires (see the spec,
"17 traits"). Each scale is one JSON file here. Agents and pilot players
answer these items; their scores become the labels the models learn from.

| File | Scale | Items | Traits | Status |
| --- | --- | --- | --- | --- |
| `mfq2.json` | MFQ-2 (Atari et al., 2023) | 36 | care, equality, proportionality, loyalty, authority, purity | English in; check the OSF licence |
| `ous.json` | Oxford Utilitarianism Scale (Kahane et al., 2018) | 9 | impartial_beneficence, instrumental_harm | English in; French to add |
| — | Short Dark Triad, SD3 (Jones & Paulhus, 2014) | 27 | machiavellianism, narcissism, psychopathy | **On hold**: not on Paulhus's public-domain list (the SD4 is) |
| — | HEXACO-60 (Ashton & Lee, 2009) | 60 | the six HEXACO factors | **On hold**: hexaco.org bars collection through a public app or site |

Do not add SD3 or HEXACO item text to this public repository until the
authors agree or the spec swaps the scale. The terms check behind this is in
the project folder (`questionnaires/licensing-check.md`).

## Format

- `id`, `name`, `citation`, `doi`, `terms`: where the scale comes from and
  what we may do with it.
- `instructions` and `response.labels`: per language (`en`, later `fr`).
- `scoring`: how trait scores are computed. Both scales score a trait as the
  mean of its items; neither has reversed items.
- `items[]`: `id` (`<scale>_<nn>`), `n` (position in the published order),
  `trait` (a key of `TRAIT_LABELS` in `game/src/profile.ts`), `reversed`,
  `text` per language. Keep the published order and wording exactly.

`game/src/scales.test.ts` checks the files.

## French

The spec uses published, validated translations only, and counts translated
items as new items.

- OUS: OUS-Fr (Carron et al., 2023, *Behavior Research Methods*,
  doi:10.3758/s13428-023-02250-x), open access, items in Table 6. The paper
  gives the response anchors in English only.
- MFQ-2: a French version was used in the paper's Study 2 (France, Belgium,
  Switzerland). It should be in the OSF materials; no separate French
  validation paper was found.
