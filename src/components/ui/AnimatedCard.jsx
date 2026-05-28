import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TYPE_COLORS } from '../../utils/constants';

/**
 * AnimatedCard - Pokemon card with staggered fly-in animation and 3D holographic hover effect
 * Combines Feature 6 (Animated Entry) + Feature 8 (3D Holographic Card)
 */
const AnimatedCard = ({ name, image, types, id, index = 0 }) => {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef(null);

  const primaryType = types?.[0] || types?.split(',')[0]?.trim() || 'normal';
  const typeColor = TYPE_COLORS[primaryType]?.bg || '#A8A878';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -15;
    const tiltY = ((x - centerX) / centerX) * 15;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Parse types if string
  const typeArray = Array.isArray(types) ? types : types?.split(',').map((t) => t.trim()) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        type: 'spring',
        stiffness: 100,
      }}
      className="perspective-[1000px]"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative rounded-2xl overflow-hidden w-60 cursor-pointer group"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Background gradient based on type */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 50% 50%, ${typeColor}, transparent 70%)` }}
        />

        {/* Holographic shine overlay */}
        <div
          className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 ${
            isHovered ? 'opacity-60' : 'opacity-0'
          }`}
          style={{
            background: `linear-gradient(
              ${105 + tilt.y * 3}deg,
              transparent 25%,
              rgba(255,255,255,0.1) 35%,
              rgba(255,200,100,0.15) 40%,
              rgba(100,200,255,0.15) 45%,
              rgba(200,100,255,0.15) 50%,
              rgba(255,255,255,0.1) 55%,
              transparent 65%
            )`,
          }}
        />

        {/* Rainbow border on hover */}
        <div
          className={`absolute inset-0 rounded-2xl z-0 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `linear-gradient(${45 + tilt.y * 2}deg, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff, #ff0080)`,
            padding: '2px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
        />

        <Link to={`/pokemon/${id}`}>
          <div className="relative z-[1] border-2 border-gray-200/30 rounded-2xl p-4 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-shadow">
            {/* Pokemon Image */}
            <div className="flex justify-center items-center h-32">
              <motion.img
                src={image}
                alt={name}
                className="w-28 h-28 object-contain drop-shadow-md"
                animate={isHovered ? { y: -5 } : { y: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                draggable={false}
              />
            </div>

            {/* Info */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400 font-mono">#{String(id).padStart(3, '0')}</p>
              <p className="font-bold text-gray-800 capitalize mt-0.5">{name}</p>
              <div className="flex gap-1.5 justify-center mt-2">
                {typeArray.map((type) => (
                  <span
                    key={type}
                    className="text-[11px] px-2.5 py-0.5 rounded-full font-medium capitalize shadow-sm"
                    style={{
                      backgroundColor: TYPE_COLORS[type]?.bg || '#A8A878',
                      color: TYPE_COLORS[type]?.text || '#fff',
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Link>

        {/* Sparkle effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  opacity: 0,
                  x: Math.random() * 200 + 20,
                  y: Math.random() * 200 + 20,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedCard;
