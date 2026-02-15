// app/api/simulate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { simulateCarAcceleration, simulateJetAcceleration, calculateAirDensity } from '@/lib/physics';
import { VEHICLE_DATABASE } from '@/lib/constants';
import { CarSpec, JetSpec, EnvironmentConfig } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, environment, powerMultiplier = 1.0, thrustMultiplier = 1.0, useAfterburnner = true } = body;

    // 데이터베이스에서 기체 찾기
    const car = VEHICLE_DATABASE.cars.find((c) => c.id === vehicleId);
    const jet = VEHICLE_DATABASE.jets.find((j) => j.id === vehicleId);

    const vehicle: CarSpec | JetSpec | null = car || jet || null;

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // 환경 설정 업데이트 (대기 밀도 계산)
    const airDensity = calculateAirDensity(environment.temperature, environment.altitude);
    const envConfig: EnvironmentConfig = {
      ...environment,
      air_density: airDensity,
    };

    // 시뮬레이션 실행
    let result;
    
    if (vehicle.category === 'car') {
      result = simulateCarAcceleration(vehicle as CarSpec, envConfig, powerMultiplier);
    } else {
      result = simulateJetAcceleration(vehicle as JetSpec, envConfig, true, useAfterburnner, thrustMultiplier);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Simulation failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
