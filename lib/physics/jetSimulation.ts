// lib/physics/jetSimulation.ts

import { PHYSICS, SIMULATION } from '../constants';
import { JetSpec, SimulationResult, EnvironmentConfig } from '../types';

/**
 * 제트 엔진 추력 계산
 */
function getJetThrustOutput(
  velocityKmh: number,
  dryThrust: number,
  wetThrust: number,
  isAfterburnner: boolean = true
): number {
  const baseThrust = isAfterburnner ? wetThrust : dryThrust;

  // 속도에 따른 보정 (간략화)
  let velocityFactor = 1.0;
  if (velocityKmh > 1200) {
    // 음속 근처/초과: 추력 감소
    velocityFactor = Math.max(0.8, 1.0 - (velocityKmh - 1200) / 2000 * 0.2);
  }

  return baseThrust * velocityFactor;
}

/**
 * 제트 항력 계산
 */
function calculateJetDrag(
  velocityKmh: number,
  dragCoeff: number,
  wingAreaM2: number,
  airDensity: number
): number {
  const velocityMs = velocityKmh / 3.6;

  // F_drag = 0.5 * ρ * v² * Cd * A
  return 0.5 * airDensity * velocityMs * velocityMs * dragCoeff * wingAreaM2;
}

/**
 * 전투기 가속 시뮬레이션 (활주로 주행 모드)
 */
export function simulateJetAcceleration(
  jetSpec: JetSpec,
  environment: EnvironmentConfig,
  useTakeoffWeight: boolean = true,
  useAfterburnner: boolean = true,
  thrustMultiplier: number = 1.0,
  maxTime: number = SIMULATION.MAX_TIME,
  dt: number = SIMULATION.DT
): SimulationResult {
  const { specs } = jetSpec;

  // 사용할 무게 결정
  const mass = useTakeoffWeight ? specs.takeoff_weight : specs.empty_weight;

  // 배열 초기화
  const timeArray: number[] = [];
  const distanceArray: number[] = [];
  const velocityArray: number[] = [];
  const accelerationArray: number[] = [];
  const gForceArray: number[] = [];

  // 상태 초기화
  let t = 0;
  let v = 0; // m/s
  let x = 0; // m
  let takeoffTime: number | undefined;
  let runwayDistance: number | undefined;

  const takeoffSpeedMs = specs.takeoff_speed / 3.6;

  // 시뮬레이션 루프
  while (t < maxTime) {
    // 1. 추력 계산
    let fThrust = getJetThrustOutput(v * 3.6, specs.dry_thrust, specs.wet_thrust, useAfterburnner);
    fThrust *= thrustMultiplier;
    fThrust *= 1000; // kN → N

    // 2. 항력 계산
    const fDrag = calculateJetDrag(v * 3.6, specs.drag_coefficient, specs.wing_area, environment.air_density);

    // 3. 순 추력
    const fNet = fThrust - fDrag;

    // 4. 가속도
    const a = fNet / mass; // m/s²

    // 5. Euler 적분
    const vNew = v + a * dt;
    const xNew = x + v * dt;

    // 6. G-Force
    const gForce = a / PHYSICS.GRAVITY;

    // 7. 데이터 기록
    timeArray.push(t);
    distanceArray.push(xNew);
    velocityArray.push(vNew * 3.6); // km/h로 변환
    accelerationArray.push(a);
    gForceArray.push(gForce);

    // 8. 이륙 조건 확인
    if (vNew >= takeoffSpeedMs && !takeoffTime) {
      takeoffTime = t;
      runwayDistance = xNew;
      // 이륙 후 1초 더 진행하고 종료
      if (t > takeoffTime + 1) {
        break;
      }
    }

    // 9. 활주로 초과 확인
    if (xNew > specs.runway_length * 1.5) {
      break;
    }

    // 상태 업데이트
    t += dt;
    v = vNew;
    x = xNew;

    // 최대 시간 체크
    if (t > maxTime) {
      break;
    }
  }

  return {
    vehicle_id: jetSpec.id,
    vehicle_name: jetSpec.name,
    category: 'fighter_jet',
    time_array: timeArray,
    distance_array: distanceArray,
    velocity_array: velocityArray,
    acceleration_array: accelerationArray,
    g_force_array: gForceArray,
    time_0_to_100: undefined, // 전투기는 0-100 기록 안 함
    time_quarter_mile: undefined,
    time_1_km: undefined,
    time_takeoff: takeoffTime,
    final_velocity: velocityArray[velocityArray.length - 1] || 0,
    final_distance: distanceArray[distanceArray.length - 1] || 0,
    runway_distance: runwayDistance,
    simulation_duration: t,
  };
}
