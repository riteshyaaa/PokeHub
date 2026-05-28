import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load all pages for code splitting
const Pokedex = lazy(() => import('../components/pokedex/Pokedex'));
const PokemonDetails = lazy(() => import('../components/pokemonDetails/PokemonDetails'));
const WhosThatPokemon = lazy(() => import('../components/games/WhosThatPokemon'));
const TeamBuilder = lazy(() => import('../components/teamBuilder/TeamBuilder'));
const BattleSimulator = lazy(() => import('../components/battle/BattleSimulator'));
const CryPlayer = lazy(() => import('../components/cryPlayer/CryPlayer'));
const SizeCompare = lazy(() => import('../components/sizeCompare/SizeCompare'));
const DailySpotlight = lazy(() => import('../components/spotlight/DailySpotlight'));
const CompletionTracker = lazy(() => import('../components/tracker/CompletionTracker'));
const WeaknessCalculator = lazy(() => import('../components/calculator/WeaknessCalculator'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto" />
      <p className="mt-3 text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

const CustomRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
        <Route path="/game" element={<WhosThatPokemon />} />
        <Route path="/team-builder" element={<TeamBuilder />} />
        <Route path="/battle" element={<BattleSimulator />} />
        <Route path="/cry-player" element={<CryPlayer />} />
        <Route path="/size-compare" element={<SizeCompare />} />
        <Route path="/spotlight" element={<DailySpotlight />} />
        <Route path="/tracker" element={<CompletionTracker />} />
        <Route path="/weakness" element={<WeaknessCalculator />} />
      </Routes>
    </Suspense>
  );
};

export default CustomRoutes;
