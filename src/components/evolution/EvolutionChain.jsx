import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchPokemonSpecies, fetchEvolutionChain, fetchPokemon, parsePokemonData } from '../../utils/pokemonApi';
import { TYPE_COLORS } from '../../utils/constants';

/**
 * EvolutionChain - Visual flowchart with branching evolution paths
 * Feature 11: Evolution Chain Timeline
 */
const EvolutionChain = ({ pokemonId, pokemonName }) => {
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const species = await fetchPokemonSpecies(pokemonId || pokemonName);
        const evoData = await fetchEvolutionChain(species.evolution_chain.url);
        const parsed = await buildChainWithImages(evoData.chain);
        setChain(parsed);
      } catch (err) {
        setError('Evolution data not available');
      }
      setLoading(false);
    };
    if (pokemonId || pokemonName) load();
  }, [pokemonId, pokemonName]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !chain) {
    return <p className="text-white/40 text-sm text-center py-4">{error}</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <h3 className="text-white font-bold text-lg mb-4">Evolution Chain</h3>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <EvolutionNode node={chain} currentId={pokemonId} />
      </div>
    </motion.div>
  );
};

const EvolutionNode = ({ node, currentId, depth = 0 }) => {
  if (!node) return null;

  const isCurrent = node.id === parseInt(currentId);
  const hasMultipleEvolutions = node.evolvesTo?.length > 1;

  return (
    <div className="flex items-center">
      {/* Pokemon sprite + info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.2 }}
        className={`text-center px-2 ${isCurrent ? 'ring-2 ring-yellow-400 rounded-xl' : ''}`}
      >
        <Link to={`/pokemon/${node.id}`} className="block hover:scale-110 transition-transform">
          <img
            src={node.image}
            alt={node.name}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto object-contain"
          />
        </Link>
        <p className="text-white text-xs font-medium capitalize mt-1">{node.name}</p>
        {node.types && (
          <div className="flex gap-0.5 justify-center mt-0.5">
            {node.types.map((t) => (
              <span
                key={t}
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: TYPE_COLORS[t]?.bg }}
                title={t}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Evolution arrows */}
      {node.evolvesTo && node.evolvesTo.length > 0 && (
        <div className="flex items-center">
          {/* Arrow connector */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{ delay: depth * 0.2 + 0.1 }}
            className="flex flex-col items-center mx-1"
          >
            <span className="text-white/30 text-lg">→</span>
            {node.evolvesTo[0]?.trigger && (
              <span className="text-[9px] text-yellow-300/70 whitespace-nowrap">
                {formatTrigger(node.evolvesTo[0])}
              </span>
            )}
          </motion.div>

          {/* Branches */}
          {hasMultipleEvolutions ? (
            <div className="flex flex-col gap-1">
              {node.evolvesTo.map((evo, i) => (
                <div key={evo.id} className="flex items-center">
                  {i > 0 && (
                    <div className="flex flex-col items-center mx-1">
                      <span className="text-[9px] text-yellow-300/70 whitespace-nowrap">
                        {formatTrigger(evo)}
                      </span>
                    </div>
                  )}
                  <EvolutionNode node={evo} currentId={currentId} depth={depth + 1} />
                </div>
              ))}
            </div>
          ) : (
            <EvolutionNode node={node.evolvesTo[0]} currentId={currentId} depth={depth + 1} />
          )}
        </div>
      )}
    </div>
  );
};

function formatTrigger(evo) {
  if (evo.minLevel) return `Lv.${evo.minLevel}`;
  if (evo.item) return evo.item.replace('-', ' ');
  if (evo.trigger === 'trade') return 'Trade';
  if (evo.trigger === 'use-item') return evo.item || 'Item';
  return '';
}

async function buildChainWithImages(chainNode) {
  const id = parseInt(chainNode.species.url.split('/').filter(Boolean).pop());
  let image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  let types = [];

  try {
    const data = await fetchPokemon(id);
    const parsed = parsePokemonData(data);
    image = parsed.sprite || image;
    types = parsed.types;
  } catch {
    // Use default sprite URL
  }

  const details = chainNode.evolution_details?.[0];
  const evolvesTo = await Promise.all(
    chainNode.evolves_to.map((next) => buildChainWithImages(next))
  );

  return {
    id,
    name: chainNode.species.name,
    image,
    types,
    trigger: details?.trigger?.name || null,
    minLevel: details?.min_level || null,
    item: details?.item?.name || null,
    evolvesTo: evolvesTo.length > 0 ? evolvesTo : null,
  };
}

export default EvolutionChain;
