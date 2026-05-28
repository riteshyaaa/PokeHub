import axios from 'axios';
import { POKEMON_API_URL, TOTAL_POKEMON } from './constants';

const api = axios.create({
  baseURL: POKEMON_API_URL,
});

/**
 * Get a random Pokemon ID
 */
export function getRandomPokemonId() {
  return Math.floor(Math.random() * TOTAL_POKEMON) + 1;
}

/**
 * Get daily Pokemon ID based on date seed
 */
export function getDailyPokemonId() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return (seed % TOTAL_POKEMON) + 1;
}

/**
 * Fetch basic Pokemon data
 */
export async function fetchPokemon(idOrName) {
  const response = await api.get(`/pokemon/${idOrName}`);
  return response.data;
}

/**
 * Fetch Pokemon species data (for flavor text, evolution chain, etc.)
 */
export async function fetchPokemonSpecies(idOrName) {
  const response = await api.get(`/pokemon-species/${idOrName}`);
  return response.data;
}

/**
 * Fetch evolution chain
 */
export async function fetchEvolutionChain(url) {
  const response = await axios.get(url);
  return response.data;
}

/**
 * Parse Pokemon data into a standardized format
 */
export function parsePokemonData(data) {
  return {
    id: data.id,
    name: data.name,
    image: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default,
    sprite: data.sprites?.front_default,
    animatedSprite: data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default,
    types: data.types.map((t) => t.type.name),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a) => a.ability.name),
    stats: data.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    cries: data.cries,
    baseExperience: data.base_experience,
  };
}

/**
 * Parse evolution chain into flat array
 */
export function parseEvolutionChain(chain) {
  const evolutions = [];

  function traverse(node, level = 0) {
    const details = node.evolution_details?.[0];
    evolutions.push({
      name: node.species.name,
      id: parseInt(node.species.url.split('/').filter(Boolean).pop()),
      level: level,
      trigger: details?.trigger?.name || null,
      minLevel: details?.min_level || null,
      item: details?.item?.name || null,
    });

    for (const next of node.evolves_to) {
      traverse(next, level + 1);
    }
  }

  traverse(chain);
  return evolutions;
}

/**
 * Find similar Pokemon based on types and stats
 */
export async function findSimilarPokemon(pokemon, count = 5) {
  // Get a pool of pokemon to compare
  const poolSize = 50;
  const randomIds = new Set();
  while (randomIds.size < poolSize) {
    const id = getRandomPokemonId();
    if (id !== pokemon.id) randomIds.add(id);
  }

  const promises = [...randomIds].map((id) =>
    fetchPokemon(id).then(parsePokemonData).catch(() => null)
  );
  const pool = (await Promise.all(promises)).filter(Boolean);

  // Score similarity
  const scored = pool.map((p) => {
    let score = 0;
    // Type match (highest weight)
    const sharedTypes = p.types.filter((t) => pokemon.types.includes(t));
    score += sharedTypes.length * 50;
    // Stat similarity
    const statDiff = pokemon.stats.reduce((sum, s, i) => {
      return sum + Math.abs(s.value - (p.stats[i]?.value || 0));
    }, 0);
    score -= statDiff * 0.1;
    return { ...p, similarityScore: score };
  });

  return scored
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, count);
}

/**
 * Get Pokemon generation
 */
export function getPokemonGeneration(id) {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}
