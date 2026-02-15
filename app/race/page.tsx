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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">Loading race results...</p>
        </div>
      </div>
    );
  }

  if (!raceData) {
    return (
      <div className="flex items-center justify-center h-full">
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

  const { vehicle1, vehicle2, environment } = raceData;
  const v1Time = vehicle1.result.time_0_to_100;
  const v2Time = vehicle2.result.time_0_to_100;
  const v1Fastest = v1Time && v2Time ? v1Time < v2Time : false;

  return (
    <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Race Results</h1>
          <div className="text-sm text-slate-400 space-y-1">
            <p>
              Temperature: {environment.temperature}°C | Altitude: {environment.altitude}m |
              Surface: {environment.surface_condition}
            </p>
          </div>
        </div>

        {/* Results Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Vehicle 1 */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{vehicle1.name}</h2>
              {vehicle1.category === 'car' ? <span className="text-3xl">🏎️</span> : <span className="text-3xl">✈️</span>}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-white font-semibold capitalize">{vehicle1.category}</span>
              </div>
              {vehicle1.category === 'car' ? (
                <>
                  <div className={`flex justify-between py-2 px-3 rounded ${v1Fastest ? 'bg-green-500/10 border border-green-500/30' : ''}`}>
                    <span className="text-slate-300">0-100 km/h:</span>
                    <span className={`font-bold ${v1Fastest ? 'text-green-400' : 'text-slate-200'}`}>
                      {vehicle1.result.time_0_to_100?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Quarter Mile (400m):</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle1.result.time_quarter_mile?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">1km Distance:</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle1.result.time_1_km?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Max Velocity:</span>
                    <span className="text-slate-200 font-semibold">
                      {(vehicle1.result.velocity_array[vehicle1.result.velocity_array.length - 1] * 3.6).toFixed(1)} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Peak G-Force:</span>
                    <span className="text-slate-200 font-semibold">
                      {Math.max(...vehicle1.result.g_force_array).toFixed(2)}G
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`flex justify-between py-2 px-3 rounded ${!v1Fastest ? 'bg-green-500/10 border border-green-500/30' : ''}`}>
                    <span className="text-slate-300">Takeoff Time:</span>
                    <span className={`font-bold ${!v1Fastest ? 'text-green-400' : 'text-slate-200'}`}>
                      {vehicle1.result.time_takeoff?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Runway Used:</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle1.result.runway_distance?.toFixed(1) || '—'}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Takeoff Speed:</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle1.result.time_takeoff ? (vehicle1.result.velocity_array[Math.round(vehicle1.result.time_takeoff / 0.01)] * 3.6).toFixed(1) : '—'} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Peak G-Force:</span>
                    <span className="text-slate-200 font-semibold">
                      {Math.max(...vehicle1.result.g_force_array).toFixed(2)}G
                    </span>
                  </div>
                </>
              )}
            </div>
          </GlassPanel>

          {/* Vehicle 2 */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{vehicle2.name}</h2>
              {vehicle2.category === 'car' ? <span className="text-3xl">🏎️</span> : <span className="text-3xl">✈️</span>}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-white font-semibold capitalize">{vehicle2.category}</span>
              </div>
              {vehicle2.category === 'car' ? (
                <>
                  <div className={`flex justify-between py-2 px-3 rounded ${!v1Fastest ? 'bg-green-500/10 border border-green-500/30' : ''}`}>
                    <span className="text-slate-300">0-100 km/h:</span>
                    <span className={`font-bold ${!v1Fastest ? 'text-green-400' : 'text-slate-200'}`}>
                      {vehicle2.result.time_0_to_100?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Quarter Mile (400m):</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle2.result.time_quarter_mile?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">1km Distance:</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle2.result.time_1_km?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Max Velocity:</span>
                    <span className="text-slate-200 font-semibold">
                      {(vehicle2.result.velocity_array[vehicle2.result.velocity_array.length - 1] * 3.6).toFixed(1)} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Peak G-Force:</span>
                    <span className="text-slate-200 font-semibold">
                      {Math.max(...vehicle2.result.g_force_array).toFixed(2)}G
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`flex justify-between py-2 px-3 rounded ${v1Fastest ? 'bg-green-500/10 border border-green-500/30' : ''}`}>
                    <span className="text-slate-300">Takeoff Time:</span>
                    <span className={`font-bold ${v1Fastest ? 'text-green-400' : 'text-slate-200'}`}>
                      {vehicle2.result.time_takeoff?.toFixed(2) || '—'}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Runway Used:</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle2.result.runway_distance?.toFixed(1) || '—'}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Takeoff Speed:</span>
                    <span className="text-slate-200 font-semibold">
                      {vehicle2.result.time_takeoff ? (vehicle2.result.velocity_array[Math.round(vehicle2.result.time_takeoff / 0.01)] * 3.6).toFixed(1) : '—'} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Peak G-Force:</span>
                    <span className="text-slate-200 font-semibold">
                      {Math.max(...vehicle2.result.g_force_array).toFixed(2)}G
                    </span>
                  </div>
                </>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Velocity over Time</h3>
            <VelocityChart
              data1_time={vehicle1.result.time_array}
              data1_velocity={vehicle1.result.velocity_array}
              data1_name={vehicle1.name}
              data2_velocity={vehicle2.result.velocity_array}
              data2_name={vehicle2.name}
            />
          </GlassPanel>

          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">G-Force over Time</h3>
            <GForceChart
              data1_time={vehicle1.result.time_array}
              data1_gforce={vehicle1.result.g_force_array}
              data1_name={vehicle1.name}
              data2_gforce={vehicle2.result.g_force_array}
              data2_name={vehicle2.name}
            />
          </GlassPanel>

          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Distance over Time</h3>
            <DistanceChart
              data1_time={vehicle1.result.time_array}
              data1_distance={vehicle1.result.distance_array}
              data1_name={vehicle1.name}
              data2_distance={vehicle2.result.distance_array}
              data2_name={vehicle2.name}
            />
          </GlassPanel>
        </div>

        {/* Winner Announcement */}
        <div className="mb-8">
          <GlassPanel className="p-8 border border-primary/30 bg-primary/5">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">🏆 Race Winner 🏆</h2>
              <p className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  {v1Fastest ? vehicle1.name : vehicle2.name}
                </span>
              </p>
              {vehicle1.category === 'car' && vehicle2.category === 'car' ? (
                <p className="text-slate-300">
                  {v1Fastest ? vehicle1.name : vehicle2.name} was faster in the 0-100 km/h acceleration!
                </p>
              ) : vehicle1.category === 'fighter_jet' && vehicle2.category === 'fighter_jet' ? (
                <p className="text-slate-300">
                  {v1Fastest ? vehicle2.name : vehicle1.name} took off first!
                </p>
              ) : (
                <p className="text-slate-300">
                  {v1Fastest && vehicle1.category === 'car'
                    ? `${vehicle1.name} dominated the car acceleration!`
                    : v1Fastest && vehicle1.category === 'fighter_jet'
                      ? `${vehicle1.name} took off before the car reached top speed!`
                      : vehicle2.category === 'car'
                        ? `${vehicle2.name} was surprisingly competitive!`
                        : `${vehicle2.name} achieved takeoff!`}
                </p>
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
    </main>
  );
}
