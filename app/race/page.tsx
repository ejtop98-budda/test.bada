// app/race/page.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VelocityChart } from '@/components/Charts/VelocityChart';
import { GForceChart } from '@/components/Charts/GForceChart';
import { DistanceChart } from '@/components/Charts/DistanceChart';
import { GlassPanel } from '@/components/shared/GlassPanel';
import type { SimulationResult, VehicleCategory } from '@/lib/types';

interface RaceResultsData {
  vehicle1: {
    id: string;
    name: string;
    category: VehicleCategory;
    result: SimulationResult;
  };
  vehicle2: {
    id: string;
    name: string;
    category: VehicleCategory;
    result: SimulationResult;
  };
  environment: {
    temperature: number;
    altitude: number;
    surface_condition: string;
  };
}

export default function RacePage() {
  const [raceData, setRaceData] = useState<RaceResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [simulationProgress, setSimulationProgress] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('raceResults');
    if (stored) {
      try {
        setRaceData(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse race results:', error);
      }
    }
    setLoading(false);
  }, []);

  // Timer interval
  useEffect(() => {
    if (loading || !raceData || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const maxTime = Math.max(
          raceData.vehicle1.result.time_array[raceData.vehicle1.result.time_array.length - 1],
          raceData.vehicle2.result.time_array[raceData.vehicle2.result.time_array.length - 1]
        );
        
        const newTime = prev + 0.01;
        if (newTime >= maxTime) {
          return maxTime;
        }
        return newTime;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [loading, raceData, isPaused]);

  useEffect(() => {
    if (!raceData) return;
    
    const maxTime = Math.max(
      raceData.vehicle1.result.time_array[raceData.vehicle1.result.time_array.length - 1],
      raceData.vehicle2.result.time_array[raceData.vehicle2.result.time_array.length - 1]
    );
    const progress = (elapsedTime / maxTime) * 100;
    setSimulationProgress(Math.min(progress, 100));
  }, [elapsedTime, raceData]);

  const getIndexAtTime = (timeArray: number[], targetTime: number) => {
    return Math.min(
      timeArray.length - 1,
      Math.floor(targetTime / 0.01)
    );
  };

  const getVehicleDataAtTime = (vehicle: RaceResultsData['vehicle1'], time: number) => {
    const idx = getIndexAtTime(vehicle.result.time_array, time);
    return {
      velocity: vehicle.result.velocity_array[idx] || 0,
      gforce: vehicle.result.g_force_array[idx] || 0,
      distance: vehicle.result.distance_array[idx] || 0,
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading race results...</p>
        </div>
      </div>
    );
  }

  if (!raceData) {
    return (
      <div className="flex items-center justify-center h-full bg-background-dark">
        <GlassPanel className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">No Race Data</h2>
          <p className="text-slate-400 mb-6">Please start a race first.</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </GlassPanel>
      </div>
    );
  }

  const v1Data = getVehicleDataAtTime(raceData.vehicle1, elapsedTime);
  const v2Data = getVehicleDataAtTime(raceData.vehicle2, elapsedTime);

  return (
    <main className="flex-1 overflow-hidden bg-background-dark relative">
      {/* Header with Timer */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">RaceSim Pro</h1>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-primary tracking-[0.15em] uppercase">ELAPSED TIME</span>
              <div className="text-4xl font-mono font-bold text-primary tracking-wider">
                {formatTime(elapsedTime)}
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                ● SIMULATION ACTIVE
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-surface-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-100"
              style={{ width: `${simulationProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-y-auto h-full pt-32">
        <div className="max-w-7xl mx-auto px-6 pb-6">
          {/* Vehicle Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Vehicle 1 */}
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{raceData.vehicle1.name}</h2>
                <span className="text-2xl">{raceData.vehicle1.category === 'car' ? '🏎️' : '✈️'}</span>
              </div>
              <div className="space-y-4">
                <div className="text-center border-b border-white/10 pb-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">VELOCITY</p>
                  <p className="text-3xl font-mono font-bold text-white">
                    {(v1Data.velocity * 3.6).toFixed(0)}
                    <span className="text-sm text-slate-400 ml-2">km/h</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">G-Force</p>
                    <p className="text-2xl font-bold text-primary">
                      {v1Data.gforce.toFixed(1)}
                      <span className="text-xs ml-1">g</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Distance</p>
                    <p className="text-2xl font-bold text-white">
                      {(v1Data.distance / 1000).toFixed(2)}
                      <span className="text-xs ml-1">km</span>
                    </p>
                  </div>
                </div>
              </div>
            </GlassPanel>

            {/* Center - Controls */}
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-col">
                <span className="text-3xl">⚡</span>
                <span className="text-xs font-bold text-primary mt-2">LIVE</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-12 h-12 rounded-full bg-primary hover:bg-primary/80 text-white flex items-center justify-center transition"
                >
                  {isPaused ? '▶' : '⏸'}
                </button>
                <Link
                  href="/"
                  className="w-12 h-12 rounded-full bg-surface-dark hover:bg-surface-dark/80 text-white flex items-center justify-center transition border border-white/10"
                >
                  ⟲
                </Link>
              </div>
            </div>

            {/* Vehicle 2 */}
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{raceData.vehicle2.name}</h2>
                <span className="text-2xl">{raceData.vehicle2.category === 'car' ? '🏎️' : '✈️'}</span>
              </div>
              <div className="space-y-4">
                <div className="text-center border-b border-white/10 pb-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">VELOCITY</p>
                  <p className="text-3xl font-mono font-bold text-white">
                    {(v2Data.velocity * 3.6).toFixed(0)}
                    <span className="text-sm text-slate-400 ml-2">km/h</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">G-Force</p>
                    <p className="text-2xl font-bold text-primary">
                      {v2Data.gforce.toFixed(1)}
                      <span className="text-xs ml-1">g</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Distance</p>
                    <p className="text-2xl font-bold text-white">
                      {(v2Data.distance / 1000).toFixed(2)}
                      <span className="text-xs ml-1">km</span>
                    </p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Velocity over Time</h3>
              <VelocityChart
                data1_time={raceData.vehicle1.result.time_array}
                data1_velocity={raceData.vehicle1.result.velocity_array}
                data1_name={raceData.vehicle1.name}
                data2_velocity={raceData.vehicle2.result.velocity_array}
                data2_name={raceData.vehicle2.name}
              />
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">G-Force over Time</h3>
              <GForceChart
                data1_time={raceData.vehicle1.result.time_array}
                data1_gforce={raceData.vehicle1.result.g_force_array}
                data1_name={raceData.vehicle1.name}
                data2_gforce={raceData.vehicle2.result.g_force_array}
                data2_name={raceData.vehicle2.name}
              />
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Distance over Time</h3>
              <DistanceChart
                data1_time={raceData.vehicle1.result.time_array}
                data1_distance={raceData.vehicle1.result.distance_array}
                data1_name={raceData.vehicle1.name}
                data2_distance={raceData.vehicle2.result.distance_array}
                data2_name={raceData.vehicle2.name}
              />
            </GlassPanel>
          </div>

          {/* Environment Info */}
          <GlassPanel className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Environment</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Temperature</p>
                <p className="text-2xl font-bold text-white">{raceData.environment.temperature}°C</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Altitude</p>
                <p className="text-2xl font-bold text-white">{raceData.environment.altitude}m</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Surface</p>
                <p className="text-2xl font-bold text-white capitalize">{raceData.environment.surface_condition}</p>
              </div>
            </div>
          </GlassPanel>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <GlassPanel className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">{raceData.vehicle1.name}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                  <span className="text-slate-300">Current Velocity:</span>
                  <span className="text-white font-semibold">{(v1Data.velocity * 3.6).toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                  <span className="text-slate-300">Max Velocity:</span>
                  <span className="text-white font-semibold">{(Math.max(...raceData.vehicle1.result.velocity_array) * 3.6).toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                  <span className="text-slate-300">Peak G-Force:</span>
                  <span className="text-white font-semibold">{Math.max(...raceData.vehicle1.result.g_force_array).toFixed(2)}G</span>
                </div>
                {raceData.vehicle1.category === 'car' && (
                  <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                    <span className="text-slate-300">0-100 km/h Time:</span>
                    <span className="text-white font-semibold">{raceData.vehicle1.result.time_0_to_100?.toFixed(2)}s</span>
                  </div>
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">{raceData.vehicle2.name}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                  <span className="text-slate-300">Current Velocity:</span>
                  <span className="text-white font-semibold">{(v2Data.velocity * 3.6).toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                  <span className="text-slate-300">Max Velocity:</span>
                  <span className="text-white font-semibold">{(Math.max(...raceData.vehicle2.result.velocity_array) * 3.6).toFixed(1)} km/h</span>
                </div>
                <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                  <span className="text-slate-300">Peak G-Force:</span>
                  <span className="text-white font-semibold">{Math.max(...raceData.vehicle2.result.g_force_array).toFixed(2)}G</span>
                </div>
                {raceData.vehicle2.category === 'car' && (
                  <div className="flex justify-between py-2 px-3 rounded bg-surface-dark">
                    <span className="text-slate-300">0-100 km/h Time:</span>
                    <span className="text-white font-semibold">{raceData.vehicle2.result.time_0_to_100?.toFixed(2)}s</span>
                  </div>
                )}
              </div>
            </GlassPanel>
          </div>

          {/* Back Button */}
          <div className="flex justify-center mb-8">
            <Link
              href="/"
              className="px-8 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg transition duration-200 inline-flex items-center gap-2"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
