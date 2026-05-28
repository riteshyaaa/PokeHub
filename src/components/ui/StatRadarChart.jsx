import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { STAT_NAMES } from '../../utils/constants';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/**
 * StatRadarChart - Hexagonal radar chart for Pokemon stats
 * Feature 10: Animated stat radar chart with compare mode
 */
const StatRadarChart = ({ pokemon1Stats, pokemon2Stats = null, pokemon1Name = '', pokemon2Name = '' }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [pokemon1Stats]);

  if (!pokemon1Stats) return null;

  const labels = pokemon1Stats.map((s) => STAT_NAMES[s.name] || s.name);
  const data1 = pokemon1Stats.map((s) => (animated ? s.value : 0));
  const data2 = pokemon2Stats?.map((s) => (animated ? s.value : 0));

  const data = {
    labels,
    datasets: [
      {
        label: pokemon1Name || 'Pokemon 1',
        data: data1,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
      },
      ...(pokemon2Stats
        ? [
            {
              label: pokemon2Name || 'Pokemon 2',
              data: data2,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.8)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(239, 68, 68, 1)',
              pointBorderColor: '#fff',
              pointBorderWidth: 1,
              pointRadius: 4,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 255,
        ticks: {
          stepSize: 50,
          display: true,
          backdropColor: 'transparent',
          color: 'rgba(255,255,255,0.4)',
          font: { size: 9 },
        },
        grid: {
          color: 'rgba(255,255,255,0.1)',
        },
        angleLines: {
          color: 'rgba(255,255,255,0.1)',
        },
        pointLabels: {
          color: 'rgba(255,255,255,0.8)',
          font: { size: 11, weight: '600' },
        },
      },
    },
    plugins: {
      legend: {
        display: !!pokemon2Stats,
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.7)',
          padding: 15,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
      },
    },
  };

  // Calculate stat total
  const statTotal = pokemon1Stats.reduce((sum, s) => sum + s.value, 0);
  const stat2Total = pokemon2Stats?.reduce((sum, s) => sum + s.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 rounded-2xl p-4 border border-white/10"
    >
      <div className="max-w-sm mx-auto">
        <Radar data={data} options={options} />
      </div>

      {/* Stat Totals */}
      <div className="flex justify-center gap-4 mt-3">
        <div className="text-center">
          <p className="text-blue-400 text-xs font-medium">{pokemon1Name || 'Total'}</p>
          <motion.p
            className="text-white font-bold text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {statTotal}
          </motion.p>
        </div>
        {pokemon2Stats && (
          <div className="text-center">
            <p className="text-red-400 text-xs font-medium">{pokemon2Name}</p>
            <motion.p
              className="text-white font-bold text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {stat2Total}
            </motion.p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatRadarChart;
