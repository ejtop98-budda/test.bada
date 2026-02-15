// lib/physics/carSimulation.ts

import { PHYSICS, SIMULATION, FRICTION_COEFFS, WEIGHT_DISTRIBUTION } from '../constants';
import { CarSpec, SimulationResult, EnvironmentConfig } from '../types';

const WHEEL_DIAMETER = 0.66; // m
const WHEEL_RADIUS = WHEEL_DIAMETER / 2;
const ROLLING_RESISTANCE_COEFF = 0.013;

/**
 * 타이어 마찰 계수 조회
 */
function getTireFrictionCoefficient(surfaceCondition: 'dry' | 'wet' | 'icy'): number {
  return FRICTION_COEFFS[surfaceCondition];
}

/**
 * 타이어 마찰 한계 추력 계산
 */
function getTireFrictionLimit(
  weight: number,
  frictionCoeff: number,
  drivetrain: 'AWD' | 'RWD' | 'FWD'
): number {
  const distribution = WEIGHT_DISTRIBUTION[drivetrain];
  return frictionCoeff * weight * PHYSICS.GRAVITY * distribution;
}

/**
 * 엔진 출력 기반 추력 계산
 */
function getEnginePowerOutput(
  horsepower: number,
  velocityKmh: number,
  torque: number = 1000
): number {
  const velocityMs = velocityKmh / 3.6;

  if (velocityMs < 0.1) {
    // 정지 상태: 최대 토크 기반
    return torque / WHEEL_RADIUS;
  }

  // 마력 기반 추력: F = P / v
  const powerWatts = horsepower * 745.7; // HP를 Watts로 변환
  return powerWatts / velocityMs;
}

/**
 * 공기 저항력 계산
 */
function calculateDragForce(
  velocityKmh: number,
  dragCoeff: number,
  frontalAreaM2: number,
  airDensity: number
): number {
  const velocityMs = velocityKmh / 3.6;

  // F_drag = 0.5 * ρ * v² * Cd * A
  return 0.5 * airDensity * velocityMs * velocityMs * dragCoeff * frontalAreaM2;
}

/**
 * 구름 저항 계산
 */
function calculateRollingResistance(weight: number): number {
  return ROLLING_RESISTANCE_COEFF * weight * PHYSICS.GRAVITY;
}

/**
 * 자동차 가속 시뮬레이션 (오일러 방법)
 */
export function simulateCarAcceleration(
  carSpec: CarSpec,
  environment: EnvironmentConfig,
  powerMultiplier: number = 1.0,
  maxTime: number = SIMULATION.MAX_TIME,
  dt: number = SIMULATION.DT
): SimulationResult {
  const { specs } = carSpec;

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

  const tireCoeff = getTireFrictionCoefficient(environment.surface_condition);
  const tireLimit = getTireFrictionLimit(specs.curb_weight, tireCoeff, specs.drivetrain);

  // 터미널 속도 추정 (항력 = 저항)
  const terminalVelocity = 150; // km/h (임시)

  let time_0_to_100: number | undefined;
  let time_quarter_mile: number | undefined;
  let time_1_km: number | undefined;

  // 시뮬레이션 루프
  while (t < maxTime) {
    // 1. 현재 타이어 마찰 추력
    const fTire = tireLimit;

    // 2. 엔진 출력 추력
    const fEngine = getEnginePowerOutput(
      specs.horsepower * powerMultiplier,
      v * 3.6, // km/h로 변환
      specs.torque
    );

    // 3. 실제 추력 (둘 중 작은 값)
    const fAvailable = Math.min(fTire, fEngine);

    // 4. 저항력 계산
    const fDrag = calculateDragForce(v * 3.6, specs.drag_coefficient, specs.frontal_area, environment.air_density);
    const fRoll = calculateRollingResistance(specs.curb_weight);
    const fResistance = fDrag + fRoll;

    // 5. 순 추력
    const fNet = fAvailable - fResistance;

    // 6. 가속도
    const a = fNet / specs.curb_weight; // m/s²

    // 7. Euler 적분
    const vNew = v + a * dt;
    const xNew = x + v * dt;

    // 8. G-Force
    const gForce = a / PHYSICS.GRAVITY;

    // 9. 데이터 기록
    timeArray.push(t);
    distanceArray.push(xNew);
    velocityArray.push(vNew * 3.6); // km/h로 변환
    accelerationArray.push(a);
    gForceArray.push(gForce);

    // 10. 주요 마일스톤 확인
    if (velocityArray[velocityArray.length - 2] < 100 && velocityArray[velocityArray.length - 1] >= 100 && !time_0_to_100) {
      time_0_to_100 = t;
    }
    if (xNew >= 400 && !time_quarter_mile) {
      time_quarter_mile = t;
    }
    if (xNew >= 1000 && !time_1_km) {
      time_1_km = t;
    }

    // 11. 종료 조건
    if (Math.abs(a) < SIMULATION.ACCEL_THRESHOLD || vNew * 3.6 > terminalVelocity) {
      break;
    }

    // 상태 업데이트
    t += dt;
    v = vNew;
    x = xNew;
  }

  return {
    vehicle_id: carSpec.id,
    vehicle_name: carSpec.name,
    category: 'car',
    time_array: timeArray,
    distance_array: distanceArray,
    velocity_array: velocityArray,
    acceleration_array: accelerationArray,
    g_force_array: gForceArray,
    time_0_to_100,
    time_quarter_mile,
    time_1_km,
    final_velocity: velocityArray[velocityArray.length - 1] || 0,
    final_distance: distanceArray[distanceArray.length - 1] || 0,
    simulation_duration: t,
  };
}
