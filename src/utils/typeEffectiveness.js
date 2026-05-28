// Full type effectiveness chart
// 2 = super effective, 0.5 = not very effective, 0 = immune, 1 = normal
const TYPE_CHART = {
  normal:   { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  fire:     { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1 },
  water:    { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  electric: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  grass:    { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1 },
  ice:      { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1 },
  fighting: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2 },
  ground:   { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1 },
  flying:   { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  psychic:  { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1 },
  bug:      { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  ghost:    { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1 },
  dragon:   { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0 },
  dark:     { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 0.5 },
  steel:    { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2 },
  fairy:    { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1 },
};

const ALL_TYPES = Object.keys(TYPE_CHART);

/**
 * Get effectiveness of an attacking type against defending types
 * @param {string} attackType - The attacking type
 * @param {string[]} defendTypes - Array of defending types
 * @returns {number} - Multiplier (4, 2, 1, 0.5, 0.25, 0)
 */
export function getAttackEffectiveness(attackType, defendTypes) {
  let multiplier = 1;
  for (const defType of defendTypes) {
    multiplier *= TYPE_CHART[attackType]?.[defType] ?? 1;
  }
  return multiplier;
}

/**
 * Get all weaknesses, resistances, and immunities for given types
 * @param {string[]} types - Array of Pokémon types
 * @returns {{ weaknesses: object, resistances: object, immunities: string[] }}
 */
export function getDefensiveMatchups(types) {
  const weaknesses = {};
  const resistances = {};
  const immunities = [];

  for (const attackType of ALL_TYPES) {
    let multiplier = 1;
    for (const defType of types) {
      multiplier *= TYPE_CHART[attackType]?.[defType] ?? 1;
    }
    if (multiplier === 0) {
      immunities.push(attackType);
    } else if (multiplier >= 2) {
      weaknesses[attackType] = multiplier;
    } else if (multiplier < 1) {
      resistances[attackType] = multiplier;
    }
  }

  return { weaknesses, resistances, immunities };
}

/**
 * Get team type coverage analysis
 * @param {Array<{types: string[]}>} team - Array of team members with types
 * @returns {{ uncovered: string[], weaknesses: object, coverage: object }}
 */
export function getTeamCoverage(team) {
  const coverageMap = {};
  const teamWeaknesses = {};

  // Calculate offensive coverage
  for (const member of team) {
    for (const type of member.types) {
      for (const targetType of ALL_TYPES) {
        const eff = TYPE_CHART[type]?.[targetType] ?? 1;
        if (eff >= 2) {
          coverageMap[targetType] = (coverageMap[targetType] || 0) + 1;
        }
      }
    }
  }

  // Calculate team weaknesses
  for (const attackType of ALL_TYPES) {
    let totalWeakMembers = 0;
    for (const member of team) {
      let multiplier = 1;
      for (const defType of member.types) {
        multiplier *= TYPE_CHART[attackType]?.[defType] ?? 1;
      }
      if (multiplier >= 2) totalWeakMembers++;
    }
    if (totalWeakMembers >= 2) {
      teamWeaknesses[attackType] = totalWeakMembers;
    }
  }

  const uncovered = ALL_TYPES.filter((t) => !coverageMap[t]);

  return { uncovered, weaknesses: teamWeaknesses, coverage: coverageMap };
}

/**
 * Calculate damage for battle simulator
 * @param {object} attacker - Attacker stats
 * @param {object} defender - Defender stats
 * @param {string} moveType - Type of the move
 * @returns {number} - Damage dealt
 */
export function calculateDamage(attacker, defender, moveType) {
  const level = 50;
  const power = 80; // Base power of a typical move
  const attack = attacker.stats.find((s) => s.name === 'attack')?.value || 50;
  const defense = defender.stats.find((s) => s.name === 'defense')?.value || 50;
  const stab = attacker.types.includes(moveType) ? 1.5 : 1;
  const effectiveness = getAttackEffectiveness(moveType, defender.types);
  const random = (Math.random() * 0.15 + 0.85);
  const critical = Math.random() < 0.0625 ? 1.5 : 1;

  const damage = Math.floor(
    ((((2 * level / 5 + 2) * power * attack / defense) / 50) + 2) *
    stab * effectiveness * random * critical
  );

  return { damage: Math.max(1, damage), critical: critical > 1, effectiveness };
}

export { ALL_TYPES, TYPE_CHART };
