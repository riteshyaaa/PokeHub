import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { TYPE_COLORS, STAT_NAMES } from '../../utils/constants';

/**
 * ShareCard - Generate beautiful Pokemon card images for sharing
 * Feature 14: html2canvas card generation, download/share
 */
const ShareCard = ({ pokemon }) => {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  if (!pokemon) return null;

  const primaryType = pokemon.types?.[0] || 'normal';
  const typeColor = TYPE_COLORS[primaryType]?.bg || '#A8A878';

  const generateImage = async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Try sharing via Web Share API first
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `${pokemon.name}-card.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${pokemon.name} - PokeHub Card`,
              files: [file],
            });
            setGenerating(false);
            return;
          }
        } catch {
          // Fall through to download
        }
      }

      // Fallback: download
      const link = document.createElement('a');
      link.download = `${pokemon.name}-pokehub-card.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate card:', err);
    }
    setGenerating(false);
  };

  return (
    <div>
      {/* Card Preview */}
      <div
        ref={cardRef}
        className="w-80 mx-auto rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${typeColor}CC, ${typeColor}88, #1a1a2e)` }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-white font-bold text-xl capitalize">{pokemon.name}</h2>
            <p className="text-white/50 text-xs font-mono">#{String(pokemon.id).padStart(3, '0')}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className="text-[10px] px-2 py-0.5 rounded-full capitalize font-bold"
                style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="flex justify-center py-4">
          <img
            src={pokemon.image || pokemon.sprite}
            alt={pokemon.name}
            className="w-36 h-36 object-contain drop-shadow-lg"
            crossOrigin="anonymous"
          />
        </div>

        {/* Stats */}
        <div className="bg-black/30 backdrop-blur-sm px-5 py-4 rounded-t-2xl">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <p className="text-white/40 text-[9px] uppercase">Height</p>
              <p className="text-white font-bold text-sm">{(pokemon.height / 10).toFixed(1)}m</p>
            </div>
            <div className="text-center">
              <p className="text-white/40 text-[9px] uppercase">Weight</p>
              <p className="text-white font-bold text-sm">{(pokemon.weight / 10).toFixed(1)}kg</p>
            </div>
            <div className="text-center">
              <p className="text-white/40 text-[9px] uppercase">Base XP</p>
              <p className="text-white font-bold text-sm">{pokemon.baseExperience || '?'}</p>
            </div>
          </div>

          {/* Stat Bars */}
          <div className="space-y-1.5">
            {pokemon.stats?.map((stat) => (
              <div key={stat.name} className="flex items-center gap-2">
                <span className="text-white/50 text-[9px] w-12 text-right font-medium">
                  {STAT_NAMES[stat.name] || stat.name}
                </span>
                <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (stat.value / 255) * 100)}%`,
                      backgroundColor: stat.value >= 100 ? '#4ade80' : stat.value >= 60 ? '#facc15' : '#f87171',
                    }}
                  />
                </div>
                <span className="text-white/60 text-[9px] w-6 font-mono">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-white/20 text-[8px]">Generated by PokeHub</span>
            <span className="text-white/20 text-[8px]">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateImage}
          disabled={generating}
          className={`px-6 py-2.5 rounded-xl font-bold transition ${
            generating
              ? 'bg-gray-600 text-white/50 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {generating ? '⏳ Generating...' : '📥 Download Card'}
        </motion.button>
      </div>
    </div>
  );
};

export default ShareCard;
