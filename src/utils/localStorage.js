const STORAGE_KEYS = {
  FAVORITES: 'pokehub_favorites',
  TEAM: 'pokehub_team',
  DISCOVERED: 'pokehub_discovered',
  GAME_SCORES: 'pokehub_game_scores',
};

/**
 * Get discovered Pokemon IDs
 */
export function getDiscoveredPokemon() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DISCOVERED);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a Pokemon as discovered
 */
export function markPokemonDiscovered(id) {
  const discovered = getDiscoveredPokemon();
  if (!discovered.includes(id)) {
    discovered.push(id);
    localStorage.setItem(STORAGE_KEYS.DISCOVERED, JSON.stringify(discovered));
  }
  return discovered;
}

/**
 * Get saved team
 */
export function getSavedTeam() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEAM);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save team
 */
export function saveTeam(team) {
  localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
}

/**
 * Get game high scores
 */
export function getGameScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_SCORES);
    return data ? JSON.parse(data) : { bestStreak: 0, totalGames: 0, totalCorrect: 0 };
  } catch {
    return { bestStreak: 0, totalGames: 0, totalCorrect: 0 };
  }
}

/**
 * Save game scores
 */
export function saveGameScores(scores) {
  localStorage.setItem(STORAGE_KEYS.GAME_SCORES, JSON.stringify(scores));
}

export { STORAGE_KEYS };
