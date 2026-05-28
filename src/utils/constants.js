// Pokemon API base URL
export const POKEMON_API_URL = 'https://pokeapi.co/api/v2';

// Total Pokemon count (Gen 1-9)
export const TOTAL_POKEMON = 1025;

// Type colors for badges and backgrounds
export const TYPE_COLORS = {
  normal: { bg: '#A8A878', text: '#ffffff' },
  fire: { bg: '#F08030', text: '#ffffff' },
  water: { bg: '#6890F0', text: '#ffffff' },
  electric: { bg: '#F8D030', text: '#000000' },
  grass: { bg: '#78C850', text: '#ffffff' },
  ice: { bg: '#98D8D8', text: '#000000' },
  fighting: { bg: '#C03028', text: '#ffffff' },
  poison: { bg: '#A040A0', text: '#ffffff' },
  ground: { bg: '#E0C068', text: '#000000' },
  flying: { bg: '#A890F0', text: '#ffffff' },
  psychic: { bg: '#F85888', text: '#ffffff' },
  bug: { bg: '#A8B820', text: '#ffffff' },
  rock: { bg: '#B8A038', text: '#ffffff' },
  ghost: { bg: '#705898', text: '#ffffff' },
  dragon: { bg: '#7038F8', text: '#ffffff' },
  dark: { bg: '#705848', text: '#ffffff' },
  steel: { bg: '#B8B8D0', text: '#000000' },
  fairy: { bg: '#EE99AC', text: '#000000' },
};

// Type gradients for dynamic backgrounds
export const TYPE_GRADIENTS = {
  normal: 'linear-gradient(135deg, #A8A878 0%, #C6C6A7 100%)',
  fire: 'linear-gradient(135deg, #F08030 0%, #F5AC78 50%, #FD1D1D 100%)',
  water: 'linear-gradient(135deg, #6890F0 0%, #9DB7F5 50%, #1CB5E0 100%)',
  electric: 'linear-gradient(135deg, #F8D030 0%, #FAE078 50%, #F7DC6F 100%)',
  grass: 'linear-gradient(135deg, #78C850 0%, #A7DB8D 50%, #56AB2F 100%)',
  ice: 'linear-gradient(135deg, #98D8D8 0%, #BCE3E3 50%, #74EBD5 100%)',
  fighting: 'linear-gradient(135deg, #C03028 0%, #D67873 50%, #EB4D4B 100%)',
  poison: 'linear-gradient(135deg, #A040A0 0%, #C183C1 50%, #8E44AD 100%)',
  ground: 'linear-gradient(135deg, #E0C068 0%, #EBD69D 50%, #D4A017 100%)',
  flying: 'linear-gradient(135deg, #A890F0 0%, #C6B7F5 50%, #667EEA 100%)',
  psychic: 'linear-gradient(135deg, #F85888 0%, #FA92B2 50%, #E91E63 100%)',
  bug: 'linear-gradient(135deg, #A8B820 0%, #C6D16E 50%, #8BC34A 100%)',
  rock: 'linear-gradient(135deg, #B8A038 0%, #D1C17D 50%, #8D6E63 100%)',
  ghost: 'linear-gradient(135deg, #705898 0%, #A292BC 50%, #6A1B9A 100%)',
  dragon: 'linear-gradient(135deg, #7038F8 0%, #A27DFA 50%, #4A00E0 100%)',
  dark: 'linear-gradient(135deg, #705848 0%, #A29288 50%, #3E2723 100%)',
  steel: 'linear-gradient(135deg, #B8B8D0 0%, #D1D1E0 50%, #78909C 100%)',
  fairy: 'linear-gradient(135deg, #EE99AC 0%, #F4BDC9 50%, #FF6F91 100%)',
};

// Generation ranges
export const GENERATIONS = {
  1: { name: 'Kanto', start: 1, end: 151 },
  2: { name: 'Johto', start: 152, end: 251 },
  3: { name: 'Hoenn', start: 252, end: 386 },
  4: { name: 'Sinnoh', start: 387, end: 493 },
  5: { name: 'Unova', start: 494, end: 649 },
  6: { name: 'Kalos', start: 650, end: 721 },
  7: { name: 'Alola', start: 722, end: 809 },
  8: { name: 'Galar', start: 810, end: 905 },
  9: { name: 'Paldea', start: 906, end: 1025 },
};

// Stat names mapping
export const STAT_NAMES = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  'speed': 'Speed',
};
