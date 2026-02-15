// components/Dashboard.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { VEHICLE_DATABASE } from '@/lib/constants';
import { CarSpec, JetSpec, EnvironmentConfig } from '@/lib/types';
import { GlassPanel } from './shared/GlassPanel';

// Fallback placeholder image
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23141820" width="800" height="600"/%3E%3Ctext x="400" y="300" text-anchor="middle" fill="%23666" font-size="40" dy=".3em"%3EImage Unavailable%3C/text%3E%3C/svg%3E';

export function Dashboard() {
  const router = useRouter();
  const [vehicle1, setVehicle1] = useState<CarSpec | JetSpec>(VEHICLE_DATABASE.cars[0]);
  const [vehicle2, setVehicle2] = useState<JetSpec | CarSpec>(VEHICLE_DATABASE.jets[0]);
  const [temperature, setTemperature] = useState(24);
  const [altitude, setAltitude] = useState(120);
  const [surfaceCondition, setSurfaceCondition] = useState<'dry' | 'wet' | 'icy'>('dry');
  const [loading, setLoading] = useState(false);

  const handleRaceStart = async () => {
    if (loading) return;
    setLoading(true);

    const environment: EnvironmentConfig = {
      temperature,
      altitude,
      surface_condition: surfaceCondition,
      air_density: 1.225, // Will be calculated by API
    };

    try {
      // Run both simulations in parallel
      const [res1, res2] = await Promise.all([
        fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: vehicle1.id,
            environment,
            powerMultiplier: 1.0,
            thrustMultiplier: 1.0,
            useAfterburnner: true,
          }),
        }),
        fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: vehicle2.id,
            environment,
            powerMultiplier: 1.0,
            thrustMultiplier: 1.0,
            useAfterburnner: true,
          }),
        }),
      ]);

      const result1 = await res1.json();
      const result2 = await res2.json();

      if (!res1.ok || !res2.ok) {
        throw new Error('Simulation failed');
      }

      // Store results in sessionStorage
      const raceData = {
        vehicle1: {
          id: vehicle1.id,
          name: vehicle1.name,
          category: vehicle1.category,
          result: result1,
        },
        vehicle2: {
          id: vehicle2.id,
          name: vehicle2.name,
          category: vehicle2.category,
          result: result2,
        },
        environment: {
          temperature,
          altitude,
          surface_condition: surfaceCondition,
        },
      };

      sessionStorage.setItem('raceResults', JSON.stringify(raceData));

      // Navigate to race results page
      router.push('/race');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const allVehicles = [...VEHICLE_DATABASE.cars, ...VEHICLE_DATABASE.jets];

  return (
    <main className="flex-1 relative z-10 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 h-full">
      {/* Left Column: Vehicle 1 */}
      <section className="flex-1 flex flex-col h-full min-w-0 group relative transition-all duration-500 hover:flex-[1.1]">
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase block mb-1">
              Challenger A
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {vehicle1.category === 'car' ? 'GROUND UNIT' : 'AERIAL UNIT'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Status</span>
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold border border-primary/20">
              READY
            </span>
          </div>
        </div>

        <div className="flex-1 bg-surface-darker border border-white/10 rounded-xl relative overflow-hidden flex flex-col shadow-2xl">
          <div className="absolute top-0 left-0 w-full z-20 p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="relative">
              <select
                value={vehicle1.id}
                onChange={(e) => {
                  const v = allVehicles.find((v) => v.id === e.target.value);
                  if (v) setVehicle1(v);
                }}
                className="w-full bg-surface-dark/90 border border-white/20 text-white rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer text-sm tracking-wide uppercase font-bold text-right"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPositionX: 'calc(100% - 0.75rem)',
                  backgroundPositionY: 'center',
                  paddingRight: '2.5rem',
                }}
              >
                {allVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10"></div>
            <Image
              src={vehicle1.imageUrl || PLACEHOLDER_IMAGE}
              alt={vehicle1.name}
              fill
              priority
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
              className="object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="relative z-20 bg-surface-dark border-t border-white/10 p-6 grid grid-cols-3 gap-4">
            {vehicle1.category === 'car' ? (
              <>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Horsepower</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {(vehicle1 as CarSpec).specs.horsepower.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500"> HP</span>
                  </p>
                </div>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">0-100 km/h</p>
                  <p className="text-xl font-bold text-primary font-mono">
                    {(vehicle1 as CarSpec).specs.acceleration_0_100?.toFixed(2) || '—'}
                    <span className="text-xs font-normal text-slate-500"> s</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Top Speed</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {(vehicle1 as CarSpec).specs.top_speed}
                    <span className="text-xs font-normal text-slate-500"> km/h</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thrust</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {Math.round((vehicle2 as JetSpec).specs.wet_thrust * 224.81 / 1000)}k
                    <span className="text-xs font-normal text-slate-500"> LBS</span>
                  </p>
                </div>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Takeoff</p>
                  <p className="text-xl font-bold text-primary font-mono">
                    {(vehicle2 as JetSpec).specs.takeoff_speed}
                    <span className="text-xs font-normal text-slate-500"> km/h</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Max Speed</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {(vehicle2 as JetSpec).specs.max_speed / 1000 > 1
                      ? `${((vehicle2 as JetSpec).specs.max_speed / 1000).toFixed(2)}k`
                      : `${(vehicle2 as JetSpec).specs.max_speed}M`}
                    <span className="text-xs font-normal text-slate-500"> km/h</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Center Column: Environment Settings */}
      <section className="lg:w-80 flex flex-col justify-center relative z-30 pointer-events-none">
        <GlassPanel className="pointer-events-auto flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary animate-spin-slow">⚙️</span>
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Environment</h3>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs uppercase tracking-wider">
              <span className="text-slate-400">Air Temp</span>
              <span className="text-primary font-bold">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="50"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-1 bg-surface-dark rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0d7ff2 0%, #0d7ff2 ${((temperature + 10) / 60) * 100}%, #1a2632 ${((temperature + 10) / 60) * 100}%, #1a2632 100%)`,
              }}
            />
          </div>

          {/* Altitude */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs uppercase tracking-wider">
              <span className="text-slate-400">Altitude</span>
              <span className="text-primary font-bold">{altitude}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              value={altitude}
              onChange={(e) => setAltitude(Number(e.target.value))}
              className="w-full h-1 bg-surface-dark rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0d7ff2 0%, #0d7ff2 ${(altitude / 5000) * 100}%, #1a2632 ${(altitude / 5000) * 100}%, #1a2632 100%)`,
              }}
            />
          </div>

          {/* Surface Type */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider block">Surface Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['dry', 'wet'] as const).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSurfaceCondition(cond)}
                  className={`px-3 py-2 rounded text-xs font-bold text-center transition border ${
                    surfaceCondition === cond
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-dark text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cond.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Race Start Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleRaceStart}
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/80 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  RACING...
                </>
              ) : (
                <>
                  🏁 START RACE
                </>
              )}
            </button>
          </div>
        </GlassPanel>

        {/* VS Badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none mt-6 lg:mt-0">
          <div
            className="w-12 h-12 rounded-full bg-black border-2 border-primary flex items-center justify-center"
            style={{
              boxShadow: '0 0 20px rgba(13, 127, 242, 0.5)',
            }}
          >
            <span className="text-lg font-bold text-white italic">VS</span>
          </div>
        </div>
      </section>

      {/* Right Column: Vehicle 2 */}
      <section className="flex-1 flex flex-col h-full min-w-0 group relative transition-all duration-500 hover:flex-[1.1]">
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase block mb-1">
              Challenger B
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {vehicle2.category === 'car' ? 'GROUND UNIT' : 'AERIAL UNIT'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Status</span>
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold border border-primary/20">
              READY
            </span>
          </div>
        </div>

        <div className="flex-1 bg-surface-darker border border-white/10 rounded-xl relative overflow-hidden flex flex-col shadow-2xl">
          <div className="absolute top-0 left-0 w-full z-20 p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="relative">
              <select
                value={vehicle2.id}
                onChange={(e) => {
                  const v = allVehicles.find((v) => v.id === e.target.value);
                  if (v) setVehicle2(v);
                }}
                className="w-full bg-surface-dark/90 border border-white/20 text-white rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer text-sm tracking-wide uppercase font-bold text-right"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPositionX: 'calc(100% - 0.75rem)',
                  backgroundPositionY: 'center',
                  paddingRight: '2.5rem',
                }}
              >
                {allVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10"></div>
            <Image
              src={vehicle2.imageUrl || PLACEHOLDER_IMAGE}
              alt={vehicle2.name}
              fill
              priority
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
              className="object-cover object-center scale-x-[-1] opacity-80 group-hover:scale-x-[-1.05] group-hover:scale-y-[1.05] transition-transform duration-700"
            />
          </div>

          <div className="relative z-20 bg-surface-dark border-t border-white/10 p-6 grid grid-cols-3 gap-4">
            {vehicle2.category === 'car' ? (
              <>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Horsepower</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {(vehicle2 as CarSpec).specs.horsepower.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500"> HP</span>
                  </p>
                </div>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">0-100 km/h</p>
                  <p className="text-xl font-bold text-primary font-mono">
                    {(vehicle2 as CarSpec).specs.acceleration_0_100?.toFixed(2) || '—'}
                    <span className="text-xs font-normal text-slate-500"> s</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Top Speed</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {(vehicle2 as CarSpec).specs.top_speed}
                    <span className="text-xs font-normal text-slate-500"> km/h</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Thrust</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {Math.round((vehicle2 as JetSpec).specs.wet_thrust * 224.81 / 1000)}k
                    <span className="text-xs font-normal text-slate-500"> LBS</span>
                  </p>
                </div>
                <div className="text-center border-r border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Takeoff</p>
                  <p className="text-xl font-bold text-primary font-mono">
                    {(vehicle2 as JetSpec).specs.takeoff_speed}
                    <span className="text-xs font-normal text-slate-500"> km/h</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Max Speed</p>
                  <p className="text-xl font-bold text-white font-mono">
                    {(vehicle2 as JetSpec).specs.max_speed / 1000 > 1
                      ? `${((vehicle2 as JetSpec).specs.max_speed / 1000).toFixed(2)}k`
                      : `${(vehicle2 as JetSpec).specs.max_speed}M`}
                    <span className="text-xs font-normal text-slate-500"> km/h</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
