"""Persona specs: target traits, a seeded backstory, and behaviour in plain words.

A persona is what an AI player is asked to be. The prompt describes behaviour
("you rarely feel guilty about using people to get ahead"), never trait names
or numbers, so the model cannot just play the label (spec, "Synthetic agents").
Target traits are z-scores. They are used only to write the prompt and, later,
to report persona fidelity; labels come from the questionnaires.

    python -m clue_harness.personas --n 20 --seed 2026 > ../agents/personas.json
    python -m clue_harness.personas --n 50 --seed 2027 --first-id 101 > ../agents/personas-phase1.json
"""

from __future__ import annotations

import argparse
import json
import random
import sys

import numpy as np

from .traits import TRAITS, correlation_matrix

# Behaviour sentences, second person. Each trait has sentences for a high and a
# low level. |z| >= STRONG uses two sentences, MODERATE <= |z| < STRONG one,
# and traits closer to the mean are left out of the prompt.
MODERATE = 0.5
STRONG = 1.2

BEHAVIOUR: dict[str, dict[str, list[str]]] = {
    "care": {
        "high": [
            "Seeing someone hurt or struggling stays with you, and you go out of your way to comfort them.",
            "You would rather lose out yourself than see someone vulnerable get hurt.",
        ],
        "low": [
            "Other people's suffering does not move you much; you think people should toughen up.",
            "You rarely go out of your way for someone just because they are having a hard time.",
        ],
    },
    "equality": {
        "high": [
            "You think everyone should end up with roughly the same share, whatever they put in.",
            "Big gaps between what people have bother you, even when the rules were followed.",
        ],
        "low": [
            "You see nothing wrong with some people ending up with far more than others.",
            "Splitting things evenly just for the sake of it strikes you as naive.",
        ],
    },
    "proportionality": {
        "high": [
            "You believe people should get what they earned: more for more effort, nothing for freeloading.",
            "It makes you angry when someone takes credit or rewards they did not earn.",
        ],
        "low": [
            "You do not keep score of who deserves what; rewards matter less to you than getting along.",
            "You are relaxed when someone gets more than they earned.",
        ],
    },
    "loyalty": {
        "high": [
            "You stand by your family, friends and team, even when they are in the wrong.",
            "Letting down your own people feels to you like the worst kind of betrayal.",
        ],
        "low": [
            "You do not feel you owe your group anything just because you belong to it.",
            "You would side with an outsider over a friend if the outsider were right.",
        ],
    },
    "authority": {
        "high": [
            "You respect rules, hierarchy and the people in charge, and you think things work better that way.",
            "Defying a boss, a parent or an official makes you uncomfortable, even when they are wrong.",
        ],
        "low": [
            "You do not give anyone respect just because of their title or position.",
            "You break rules you find pointless without a second thought.",
        ],
    },
    "purity": {
        "high": [
            "Some things feel degrading or unclean to you, even when they harm no one, and you keep away from them.",
            "You value restraint and decency, and things that feel dirty or used put you off.",
        ],
        "low": [
            "You are hard to disgust; second-hand, messy or unusual things do not bother you.",
            "You think if something harms no one, how it looks or feels does not matter.",
        ],
    },
    "instrumental_harm": {
        "high": [
            "You would accept hurting one person if it clearly saved several others.",
            "You judge choices by their results; clean hands matter less to you than outcomes.",
        ],
        "low": [
            "There are things you will not do to someone, however much good it might bring.",
            "Deliberately harming an innocent person is off the table for you, whatever the numbers say.",
        ],
    },
    "impartial_beneficence": {
        "high": [
            "A stranger's well-being counts as much to you as your own or your family's.",
            "You feel you should help anyone you can, near or far, even at real cost to yourself.",
        ],
        "low": [
            "You look after yourself and your own first; strangers are not your responsibility.",
            "You do not feel obliged to make sacrifices for people you will never meet.",
        ],
    },
    "machiavellianism": {
        "high": [
            "You keep useful information to yourself and use it when it gives you leverage.",
            "You think most people can be steered if you know what they want, and you do not mind doing the steering.",
        ],
        "low": [
            "Scheming and playing people off against each other is not in you.",
            "You say what you want plainly and do not plan moves against people.",
        ],
    },
    "narcissism": {
        "high": [
            "You know you are better than most people at most things, and you like it when others notice.",
            "You enjoy being the centre of attention and expect to be treated as someone special.",
        ],
        "low": [
            "You are uncomfortable in the spotlight and play down your own achievements.",
            "You do not think you deserve more attention or praise than anyone else.",
        ],
    },
    "psychopathy": {
        "high": [
            "You rarely feel guilty, and you act on impulse even when someone could get hurt.",
            "You like thrills and risks, and you can be cold or harsh when someone gets in your way.",
        ],
        "low": [
            "You think before you act, and you feel bad for a long time if you hurt someone.",
            "You avoid needless risks and cannot stay cold when someone is upset.",
        ],
    },
    "honesty_humility": {
        "high": [
            "You would not lie or cheat to get ahead, even if you were sure you would never be caught.",
            "Money, status and luxury do not matter much to you.",
        ],
        "low": [
            "You would bend the truth or the rules if it got you something you wanted and nobody would know.",
            "You want money, status and nice things, and you are not shy about going after them.",
        ],
    },
    "emotionality": {
        "high": [
            "You worry a lot, feel others' feelings strongly, and lean on people close to you when things go wrong.",
            "Danger and uncertainty make you anxious, and you tend to play it safe.",
        ],
        "low": [
            "You stay calm under pressure and rarely worry about what might go wrong.",
            "You handle problems on your own and do not need others for reassurance.",
        ],
    },
    "extraversion": {
        "high": [
            "You love being around people, speak up easily and feel energised by a crowd.",
            "You are confident in social situations and happy to take the lead.",
        ],
        "low": [
            "You prefer quiet evenings and small groups, and big gatherings drain you.",
            "You keep to yourself in groups and rarely speak up first.",
        ],
    },
    "agreeableness": {
        "high": [
            "You forgive easily, stay patient, and avoid arguing even when you disagree.",
            "You go along with others to keep the peace and are slow to criticise.",
        ],
        "low": [
            "You hold grudges, say bluntly when you disagree, and lose patience quickly.",
            "You would rather have an argument than let something slide.",
        ],
    },
    "conscientiousness": {
        "high": [
            "You plan ahead, keep your things in order and finish what you start.",
            "You are careful and thorough, and you hate leaving a job half done.",
        ],
        "low": [
            "You take things as they come, leave tasks to the last minute and do not mind a bit of mess.",
            "You often act without planning and let details slide.",
        ],
    },
    "openness": {
        "high": [
            "You are curious about unusual ideas, art and ways of living, and you like trying new things.",
            "You enjoy questioning how things are usually done.",
        ],
        "low": [
            "You prefer the familiar and practical, and you find abstract ideas a waste of time.",
            "You stick to what you know works rather than trying new things.",
        ],
    },
}

# Extreme archetypes, about 10% of personas, so the tails are covered.
ARCHETYPES: dict[str, dict[str, float]] = {
    "dark-triad": {
        "machiavellianism": 2.2,
        "narcissism": 2.0,
        "psychopathy": 2.2,
        "honesty_humility": -2.0,
        "care": -1.5,
        "agreeableness": -1.2,
        "emotionality": -1.0,
    },
    "hyper-utilitarian": {
        "instrumental_harm": 2.3,
        "impartial_beneficence": 2.2,
        "loyalty": -1.2,
        "purity": -1.2,
        "authority": -1.0,
        "openness": 1.0,
    },
    "purity-driven": {
        "purity": 2.3,
        "authority": 1.8,
        "loyalty": 1.6,
        "openness": -1.4,
        "instrumental_harm": -1.3,
        "conscientiousness": 1.0,
    },
}

FIRST_NAMES = [
    "Camille", "Lucas", "Amina", "Thomas", "Sofia", "Hugo", "Leila", "Mateo",
    "Chloé", "Yanis", "Ines", "Jonas", "Emma", "Karim", "Nora", "Pablo",
    "Julia", "Malik", "Hanna", "Rafael", "Lina", "Théo", "Zoé", "Samuel",
    "Aïcha", "Victor", "Elif", "Noah", "Maya", "Tom",
]
COUNTRIES = ["FR", "FR", "FR", "BE", "CH", "DE", "ES", "IT", "GB", "IE", "NL", "PT", "CA", "US"]
AGE_BRACKETS = ["18-24", "25-29", "30-39", "30-39", "40-49", "50-59", "60-69"]
OCCUPATIONS = [
    "nurse", "sales manager", "software developer", "primary school teacher",
    "electrician", "accountant", "student", "restaurant owner", "bus driver",
    "pharmacist", "marketing consultant", "warehouse supervisor", "lawyer",
    "graphic designer", "farmer", "retired engineer", "hairdresser",
    "civil servant", "real estate agent", "research technician",
]
HOUSEHOLDS = [
    "live alone in a small flat",
    "live with your partner and your two children",
    "share a flat with two friends",
    "live with your parents to save money",
    "are divorced and see your child every other weekend",
    "live with your partner and a dog",
    "recently moved to a new city for work",
    "look after an elderly parent",
]
DETAILS = [
    "spend your weekends hiking",
    "play in an amateur football team",
    "are saving to buy a house",
    "volunteer at a food bank once a month",
    "are learning to play the guitar",
    "are paying off a loan from a failed business",
    "follow the news closely",
    "spend a lot of time on video games",
    "run a small online shop on the side",
    "have just been promoted",
    "are training for a marathon",
    "are close to your sister and call her every day",
    "recently went through a hard break-up",
    "cook for friends most weekends",
]


def _age_years(bracket: str, rng: random.Random) -> int:
    lo, hi = (int(x) for x in bracket.split("-"))
    return rng.randint(lo, hi)


def behaviour_lines(traits: dict[str, float], rng: random.Random) -> list[str]:
    """Behaviour sentences for every trait far enough from the mean, strongest first."""
    lines: list[str] = []
    for t in sorted(traits, key=lambda t: -abs(traits[t])):
        z = traits[t]
        if abs(z) < MODERATE:
            continue
        bank = BEHAVIOUR[t]["high" if z > 0 else "low"]
        k = 2 if abs(z) >= STRONG else 1
        lines.extend(rng.sample(bank, k))
    return lines


class _Deck:
    """Draws without replacement (reshuffling when used up), so personas differ."""

    def __init__(self, values: list[str], rng: random.Random):
        self.values, self.rng, self.left = values, rng, []

    def draw(self, ok=lambda v: True) -> str:
        for _ in range(2):
            for i, v in enumerate(self.left):
                if ok(v):
                    return self.left.pop(i)
            self.left = self.rng.sample(self.values, len(self.values))
        raise ValueError("no value fits")


class _Decks:
    def __init__(self, rng: random.Random):
        self.names = _Deck(FIRST_NAMES, rng)
        self.brackets = _Deck(AGE_BRACKETS, rng)
        self.occupations = _Deck(OCCUPATIONS, rng)
        self.countries = _Deck(COUNTRIES, rng)
        self.households = _Deck(HOUSEHOLDS, rng)
        self.details = _Deck(DETAILS, rng)


def make_persona(index: int, traits: dict[str, float], archetype: str, rng: random.Random, decks: _Decks) -> dict:
    name = decks.names.draw()
    bracket = decks.brackets.draw()
    age = _age_years(bracket, rng)
    occupation = decks.occupations.draw(lambda o: o in _occupations_for(age))
    country = decks.countries.draw()
    young = age < 25
    household = decks.households.draw(lambda h: not (young and ("child" in h or "divorced" in h)))
    no_promo = occupation in ("student", "retired engineer")
    first = decks.details.draw(lambda d: not (no_promo and "promoted" in d))
    second = decks.details.draw(lambda d: d != first and not (no_promo and "promoted" in d))
    backstory = (
        f"You are {name}, {age}, {_article(occupation)} {occupation} from {_COUNTRY_NAMES[country]}. "
        f"You {household}. You {first}, and you {second}."
    )
    return {
        "persona_id": f"p{index:03d}",
        "archetype": archetype,
        "target_traits": {t: round(traits[t], 2) for t in TRAITS},
        "demographics": {"age_bracket": bracket, "country": country, "occupation": occupation},
        "backstory": backstory,
        "behaviour": behaviour_lines(traits, rng),
        "seed": rng.randrange(2**31),
    }


_COUNTRY_NAMES = {
    "FR": "France", "BE": "Belgium", "CH": "Switzerland", "DE": "Germany", "ES": "Spain",
    "IT": "Italy", "GB": "the United Kingdom", "IE": "Ireland", "NL": "the Netherlands",
    "PT": "Portugal", "CA": "Canada", "US": "the United States",
}


def _occupations_for(age: int) -> list[str]:
    if age < 25:
        return [o for o in OCCUPATIONS if o not in ("retired engineer", "lawyer", "pharmacist")]
    jobs = [o for o in OCCUPATIONS if o != "student" or age < 30]
    return jobs if age >= 62 else [o for o in jobs if o != "retired engineer"]


def _article(word: str) -> str:
    return "an" if word[0] in "aeiou" else "a"


def generate(n: int, seed: int, archetype_share: float = 0.1, first_id: int = 1) -> list[dict]:
    """n personas: about archetype_share extreme archetypes, the rest sampled from the prior.
    Ids run from p{first_id:03d}, so persona sets for different phases never share an id."""
    rng = random.Random(seed)
    np_rng = np.random.default_rng(seed)
    # Cholesky rather than multivariate_normal: its SVD can differ across
    # platforms, and the committed personas must be reproducible anywhere.
    chol = np.linalg.cholesky(correlation_matrix())
    draw = lambda: chol @ np_rng.standard_normal(len(TRAITS))  # noqa: E731
    # At least one of each archetype once there are enough personas.
    n_arch = max(round(n * archetype_share), len(ARCHETYPES)) if n >= 10 else 0
    arch_names = list(ARCHETYPES)
    decks = _Decks(rng)
    personas = []
    for i in range(1, n + 1):
        if i > n - n_arch:
            name = arch_names[(i - (n - n_arch) - 1) % len(arch_names)]
            # Archetype levels plus a little noise; other traits drawn small.
            z = draw() * 0.4
            traits = dict(zip(TRAITS, z.tolist()))
            for t, v in ARCHETYPES[name].items():
                traits[t] = v + float(np_rng.normal(0, 0.2))
        else:
            name = "sampled"
            z = draw()
            traits = dict(zip(TRAITS, z.tolist()))
        personas.append(make_persona(first_id - 1 + i, traits, name, rng, decks))
    return personas


SYSTEM_TEMPLATE = (
    "{backstory}\n\n"
    "What you are like:\n{behaviour}\n\n"
    "Stay in character. Answer every question the way this person really would, "
    "not the way that looks best or that you think is expected."
)


def system_prompt(persona: dict) -> str:
    behaviour = "\n".join(f"- {line}" for line in persona["behaviour"]) or "- You are an ordinary person."
    return SYSTEM_TEMPLATE.format(backstory=persona["backstory"], behaviour=behaviour)


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--n", type=int, default=20)
    p.add_argument("--seed", type=int, default=2026)
    p.add_argument("--first-id", type=int, default=1, help="number of the first persona id")
    args = p.parse_args(argv)
    json.dump(generate(args.n, args.seed, first_id=args.first_id), sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
