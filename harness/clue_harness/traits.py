"""The 17 trait dimensions and a rough prior over them.

Names match TRAIT_LABELS in game/src/profile.ts. The correlations are
approximate, taken loosely from the published scale literature (dark triad
inter-correlations, honesty-humility against the dark traits, the binding
moral foundations clustering together). The spec says to refit them on the
human pilot; until then they only need to keep sampled personas plausible.
"""

from __future__ import annotations

import numpy as np

TRAITS: list[str] = [
    "care",
    "equality",
    "proportionality",
    "loyalty",
    "authority",
    "purity",
    "instrumental_harm",
    "impartial_beneficence",
    "machiavellianism",
    "narcissism",
    "psychopathy",
    "honesty_humility",
    "emotionality",
    "extraversion",
    "agreeableness",
    "conscientiousness",
    "openness",
]

# Pairs not listed are 0.
_PAIRS: dict[tuple[str, str], float] = {
    ("care", "equality"): 0.45,
    ("care", "impartial_beneficence"): 0.30,
    ("care", "agreeableness"): 0.30,
    ("care", "emotionality"): 0.30,
    ("care", "psychopathy"): -0.40,
    ("care", "machiavellianism"): -0.25,
    ("loyalty", "authority"): 0.55,
    ("loyalty", "purity"): 0.45,
    ("authority", "purity"): 0.55,
    ("proportionality", "authority"): 0.25,
    ("authority", "openness"): -0.25,
    ("purity", "openness"): -0.25,
    ("equality", "proportionality"): -0.15,
    ("instrumental_harm", "psychopathy"): 0.30,
    ("instrumental_harm", "care"): -0.15,
    ("impartial_beneficence", "openness"): 0.15,
    ("machiavellianism", "narcissism"): 0.30,
    ("machiavellianism", "psychopathy"): 0.55,
    ("narcissism", "psychopathy"): 0.30,
    ("honesty_humility", "machiavellianism"): -0.50,
    ("honesty_humility", "narcissism"): -0.45,
    ("honesty_humility", "psychopathy"): -0.45,
    ("emotionality", "psychopathy"): -0.35,
    ("agreeableness", "psychopathy"): -0.40,
    ("agreeableness", "machiavellianism"): -0.25,
    ("conscientiousness", "psychopathy"): -0.30,
    ("extraversion", "narcissism"): 0.40,
}


def correlation_matrix() -> np.ndarray:
    """The prior correlation matrix, nudged to be positive definite."""
    n = len(TRAITS)
    idx = {t: i for i, t in enumerate(TRAITS)}
    m = np.eye(n)
    for (a, b), r in _PAIRS.items():
        m[idx[a], idx[b]] = m[idx[b], idx[a]] = r
    w, v = np.linalg.eigh(m)
    if w.min() < 1e-3:
        w = np.clip(w, 1e-3, None)
        m = v @ np.diag(w) @ v.T
        d = np.sqrt(np.diag(m))
        m = m / np.outer(d, d)
    return m
