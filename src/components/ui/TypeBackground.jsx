import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TYPE_GRADIENTS, TYPE_COLORS } from '../../utils/constants';

/**
 * TypeBackground - Dynamic animated background based on Pokemon type
 * Feature 7: Background changes based on type with particle effects
 */
const TypeBackground = ({ types = [], children, className = '' }) => {
  const primaryType = types[0] || 'normal';
  const gradient = TYPE_GRADIENTS[primaryType] || TYPE_GRADIENTS.normal;
  const color = TYPE_COLORS[primaryType]?.bg || '#A8A878';

  // Generate particles based on type
  const particles = useMemo(() => {
    const particleConfig = getParticleConfig(primaryType);
    return Array.from({ length: particleConfig.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * particleConfig.maxSize + particleConfig.minSize,
      duration: Math.random() * 3 + particleConfig.baseDuration,
      delay: Math.random() * 2,
      ...particleConfig,
    }));
  }, [primaryType]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: gradient }}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <TypeParticle key={particle.id} particle={particle} type={primaryType} color={color} />
        ))}
      </div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${color}30 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 70% 80%, ${color}20 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

function getParticleConfig(type) {
  switch (type) {
    case 'fire':
      return { count: 20, minSize: 3, maxSize: 8, baseDuration: 2, shape: 'circle', emoji: '🔥' };
    case 'water':
      return { count: 15, minSize: 4, maxSize: 10, baseDuration: 3, shape: 'drop', emoji: '💧' };
    case 'electric':
      return { count: 12, minSize: 2, maxSize: 5, baseDuration: 0.5, shape: 'bolt', emoji: '⚡' };
    case 'grass':
      return { count: 18, minSize: 5, maxSize: 12, baseDuration: 4, shape: 'leaf', emoji: '🍃' };
    case 'ice':
      return { count: 20, minSize: 3, maxSize: 8, baseDuration: 5, shape: 'snowflake', emoji: '❄️' };
    case 'psychic':
      return { count: 10, minSize: 4, maxSize: 12, baseDuration: 3, shape: 'circle', emoji: '✨' };
    case 'ghost':
      return { count: 8, minSize: 6, maxSize: 14, baseDuration: 4, shape: 'circle', emoji: '👻' };
    case 'dragon':
      return { count: 10, minSize: 3, maxSize: 7, baseDuration: 2, shape: 'circle', emoji: '🐉' };
    case 'fairy':
      return { count: 15, minSize: 3, maxSize: 8, baseDuration: 3, shape: 'star', emoji: '✨' };
    case 'dark':
      return { count: 8, minSize: 5, maxSize: 15, baseDuration: 5, shape: 'circle', emoji: '🌑' };
    case 'poison':
      return { count: 12, minSize: 4, maxSize: 10, baseDuration: 3, shape: 'circle', emoji: '☠️' };
    case 'flying':
      return { count: 8, minSize: 4, maxSize: 10, baseDuration: 4, shape: 'circle', emoji: '🌬️' };
    default:
      return { count: 10, minSize: 3, maxSize: 8, baseDuration: 4, shape: 'circle', emoji: '✦' };
  }
}

const TypeParticle = ({ particle, type, color }) => {
  const getAnimation = () => {
    switch (type) {
      case 'fire':
        return {
          y: [0, -200],
          x: [0, (Math.random() - 0.5) * 50],
          opacity: [0.8, 0],
          scale: [1, 0.3],
        };
      case 'water':
        return {
          y: [0, 200],
          x: [0, (Math.random() - 0.5) * 30],
          opacity: [0.6, 0],
          scale: [0.5, 1],
        };
      case 'electric':
        return {
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
          x: [(Math.random() - 0.5) * 100],
          y: [(Math.random() - 0.5) * 100],
        };
      case 'grass':
        return {
          y: [0, 150],
          x: [0, Math.sin(Math.random() * Math.PI) * 80],
          rotate: [0, 360],
          opacity: [0.7, 0],
        };
      case 'ice':
        return {
          y: [0, 200],
          x: [0, (Math.random() - 0.5) * 40],
          rotate: [0, 180],
          opacity: [0.8, 0],
        };
      case 'ghost':
        return {
          y: [0, -100, 0],
          x: [0, (Math.random() - 0.5) * 60, 0],
          opacity: [0, 0.6, 0],
          scale: [0.5, 1.2, 0.5],
        };
      default:
        return {
          y: [0, -100],
          opacity: [0.5, 0],
          scale: [1, 0.5],
        };
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        fontSize: `${particle.size}px`,
      }}
      animate={getAnimation()}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <span style={{ opacity: 0.7 }}>{particle.emoji}</span>
    </motion.div>
  );
};

export default TypeBackground;
