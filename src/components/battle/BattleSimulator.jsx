import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPokemon, parsePokemonData, getRandomPokemonId } from '../../utils/pokemonApi';
import { calculateDamage } from '../../utils/typeEffectiveness';
import { TYPE_COLORS } from '../../utils/constants';

const BATTLE_STATES = {
  SETUP: 'setup',
  BATTLING: 'battling',
  ANIMATING: 'animating',
  FINISHED: 'finished',
};

const BattleSimulator = () => {
  const [battleState, setBattleState] = useState(BATTLE_STATES.SETUP);
  const [player, setPlayer] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [playerMaxHP, setPlayerMaxHP] = useState(100);
  const [opponentMaxHP, setOpponentMaxHP] = useState(100);
  const [battleLog, setBattleLog] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('player');
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeOpponent, setShakeOpponent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [winner, setWinner] = useState(null);
  const logRef = useRef(null);

  // Search for Pokemon
  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await fetchPokemon(query.toLowerCase());
      setSearchResults([parsePokemonData(data)]);
    } catch {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
        const list = await response.json();
        const matches = list.results
          .filter((p) => p.name.includes(query.toLowerCase()))
          .slice(0, 6);
        const results = await Promise.all(
          matches.map(async (m) => {
            const d = await fetchPokemon(m.name);
            return parsePokemonData(d);
          })
        );
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]);

  // Select player Pokemon and pick random opponent
  const selectPokemon = async (pokemon) => {
    setPlayer(pokemon);
    setSearchQuery('');
    setSearchResults([]);

    // Pick random opponent
    try {
      const oppId = getRandomPokemonId();
      const oppData = await fetchPokemon(oppId);
      setOpponent(parsePokemonData(oppData));
    } catch {
      const oppData = await fetchPokemon(25); // Fallback to Pikachu
      setOpponent(parsePokemonData(oppData));
    }
  };

  // Start battle
  const startBattle = () => {
    if (!player || !opponent) return;
    const pHP = player.stats.find((s) => s.name === 'hp')?.value || 100;
    const oHP = opponent.stats.find((s) => s.name === 'hp')?.value || 100;
    setPlayerHP(pHP);
    setOpponentHP(oHP);
    setPlayerMaxHP(pHP);
    setOpponentMaxHP(oHP);
    setBattleLog([{ text: `Battle Start! ${player.name} vs ${opponent.name}!`, type: 'system' }]);
    setCurrentTurn('player');
    setBattleState(BATTLE_STATES.BATTLING);
  };

  // Player attacks
  const playerAttack = () => {
    if (currentTurn !== 'player' || battleState !== BATTLE_STATES.BATTLING) return;
    setBattleState(BATTLE_STATES.ANIMATING);

    const moveType = player.types[Math.floor(Math.random() * player.types.length)];
    const result = calculateDamage(player, opponent, moveType);

    setShakeOpponent(true);
    setTimeout(() => setShakeOpponent(false), 500);

    const newHP = Math.max(0, opponentHP - result.damage);
    setOpponentHP(newHP);

    let logEntry = `${player.name} used a ${moveType} attack! Dealt ${result.damage} damage!`;
    if (result.critical) logEntry += ' Critical hit!';
    if (result.effectiveness > 1) logEntry += " It's super effective!";
    else if (result.effectiveness < 1 && result.effectiveness > 0) logEntry += " It's not very effective...";
    else if (result.effectiveness === 0) logEntry += ' It had no effect!';

    setBattleLog((prev) => [...prev, { text: logEntry, type: 'player' }]);

    if (newHP <= 0) {
      setTimeout(() => {
        setWinner('player');
        setBattleState(BATTLE_STATES.FINISHED);
        setBattleLog((prev) => [...prev, { text: `${opponent.name} fainted! You win!`, type: 'system' }]);
      }, 800);
    } else {
      setTimeout(() => {
        setCurrentTurn('opponent');
        setBattleState(BATTLE_STATES.BATTLING);
        // Opponent auto-attacks after delay
        setTimeout(() => opponentAttack(newHP), 1000);
      }, 800);
    }
  };

  // Opponent attacks
  const opponentAttack = (currentOpponentHP) => {
    if (currentOpponentHP <= 0) return;
    setBattleState(BATTLE_STATES.ANIMATING);

    const moveType = opponent.types[Math.floor(Math.random() * opponent.types.length)];
    const result = calculateDamage(opponent, player, moveType);

    setShakePlayer(true);
    setTimeout(() => setShakePlayer(false), 500);

    const newHP = Math.max(0, playerHP - result.damage);
    setPlayerHP(newHP);

    let logEntry = `${opponent.name} used a ${moveType} attack! Dealt ${result.damage} damage!`;
    if (result.critical) logEntry += ' Critical hit!';
    if (result.effectiveness > 1) logEntry += " It's super effective!";
    else if (result.effectiveness < 1 && result.effectiveness > 0) logEntry += " It's not very effective...";
    else if (result.effectiveness === 0) logEntry += ' It had no effect!';

    setBattleLog((prev) => [...prev, { text: logEntry, type: 'opponent' }]);

    if (newHP <= 0) {
      setTimeout(() => {
        setWinner('opponent');
        setBattleState(BATTLE_STATES.FINISHED);
        setBattleLog((prev) => [...prev, { text: `${player.name} fainted! You lose!`, type: 'system' }]);
      }, 800);
    } else {
      setTimeout(() => {
        setCurrentTurn('player');
        setBattleState(BATTLE_STATES.BATTLING);
      }, 800);
    }
  };

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const resetBattle = () => {
    setBattleState(BATTLE_STATES.SETUP);
    setPlayer(null);
    setOpponent(null);
    setPlayerHP(100);
    setOpponentHP(100);
    setBattleLog([]);
    setWinner(null);
    setCurrentTurn('player');
  };

  const rematch = () => {
    const pHP = player.stats.find((s) => s.name === 'hp')?.value || 100;
    const oHP = opponent.stats.find((s) => s.name === 'hp')?.value || 100;
    setPlayerHP(pHP);
    setOpponentHP(oHP);
    setPlayerMaxHP(pHP);
    setOpponentMaxHP(oHP);
    setBattleLog([{ text: `Rematch! ${player.name} vs ${opponent.name}!`, type: 'system' }]);
    setCurrentTurn('player');
    setWinner(null);
    setBattleState(BATTLE_STATES.BATTLING);
  };

  // HP Bar component
  const HPBar = ({ current, max, label, isPlayer }) => {
    const percentage = Math.max(0, (current / max) * 100);
    const color = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>{label}</span>
          <span>{current}/{max} HP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${color}`}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/30 to-gray-900 p-4 flex flex-col items-center">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-6 text-center"
      >
        ⚔️ Battle Simulator
      </motion.h1>

      <AnimatePresence mode="wait">
        {/* SETUP PHASE */}
        {battleState === BATTLE_STATES.SETUP && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Choose Your Pokémon</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-500 transition"
              />

              {/* Search results */}
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {searching && (
                  <div className="text-center py-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  </div>
                )}
                {searchResults.map((pokemon) => (
                  <motion.div
                    key={pokemon.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => selectPokemon(pokemon)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition"
                  >
                    <img src={pokemon.sprite || pokemon.image} alt={pokemon.name} className="w-12 h-12" />
                    <div>
                      <p className="text-white font-medium capitalize">{pokemon.name}</p>
                      <div className="flex gap-1">
                        {pokemon.types.map((type) => (
                          <span key={type} className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selected Pokemon Preview */}
              {player && opponent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <img src={player.image || player.sprite} alt={player.name} className="w-20 h-20 mx-auto" />
                      <p className="text-white capitalize text-sm font-medium">{player.name}</p>
                    </div>
                    <span className="text-2xl font-bold text-red-400">VS</span>
                    <div className="text-center">
                      <img src={opponent.image || opponent.sprite} alt={opponent.name} className="w-20 h-20 mx-auto" />
                      <p className="text-white capitalize text-sm font-medium">{opponent.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={startBattle}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
                  >
                    Start Battle!
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* BATTLE PHASE */}
        {(battleState === BATTLE_STATES.BATTLING || battleState === BATTLE_STATES.ANIMATING || battleState === BATTLE_STATES.FINISHED) && player && opponent && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl"
          >
            {/* Battle Arena */}
            <div className="bg-gradient-to-b from-green-900/30 to-green-800/10 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>

              <div className="relative z-10">
                {/* Opponent */}
                <div className="flex justify-end mb-2">
                  <div className="w-48">
                    <HPBar current={opponentHP} max={opponentMaxHP} label={opponent.name} />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-8">
                  {/* Player Pokemon */}
                  <motion.div
                    animate={shakePlayer ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                  >
                    <motion.img
                      src={player.image || player.sprite}
                      alt={player.name}
                      className="w-32 h-32 object-contain drop-shadow-lg"
                      animate={playerHP <= 0 ? { opacity: 0, y: 50 } : {}}
                    />
                  </motion.div>

                  {/* VS indicator */}
                  <div className="text-white/20 text-xl font-bold">⚔️</div>

                  {/* Opponent Pokemon */}
                  <motion.div
                    animate={shakeOpponent ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                  >
                    <motion.img
                      src={opponent.image || opponent.sprite}
                      alt={opponent.name}
                      className="w-32 h-32 object-contain drop-shadow-lg"
                      animate={opponentHP <= 0 ? { opacity: 0, y: 50 } : {}}
                    />
                  </motion.div>
                </div>

                {/* Player HP */}
                <div className="w-48">
                  <HPBar current={playerHP} max={playerMaxHP} label={player.name} />
                </div>
              </div>
            </div>

            {/* Battle Log */}
            <div
              ref={logRef}
              className="mt-4 bg-black/30 rounded-xl p-4 max-h-32 overflow-y-auto border border-white/10"
            >
              {battleLog.map((entry, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm mb-1 ${
                    entry.type === 'system' ? 'text-yellow-300 font-semibold' :
                    entry.type === 'player' ? 'text-blue-300' : 'text-red-300'
                  }`}
                >
                  {entry.text}
                </motion.p>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3 justify-center">
              {battleState === BATTLE_STATES.BATTLING && currentTurn === 'player' && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playerAttack}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg"
                >
                  ⚡ Attack!
                </motion.button>
              )}

              {battleState === BATTLE_STATES.ANIMATING && (
                <p className="text-white/50 py-3">...</p>
              )}

              {battleState === BATTLE_STATES.BATTLING && currentTurn === 'opponent' && (
                <p className="text-red-300 py-3 animate-pulse">Opponent is attacking...</p>
              )}

              {battleState === BATTLE_STATES.FINISHED && (
                <div className="flex flex-col items-center gap-3">
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-2xl font-bold ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {winner === 'player' ? '🎉 Victory!' : '💀 Defeat!'}
                  </motion.p>
                  <div className="flex gap-3">
                    <button onClick={rematch} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl">
                      Rematch
                    </button>
                    <button onClick={resetBattle} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl">
                      New Battle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleSimulator;
