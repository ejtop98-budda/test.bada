// lib/physics/airDensity.ts

import { PHYSICS } from '../constants';

/**
 * ISA 표준 대기 모델 기반 대기 밀도 계산
 *
 * @param temperatureCelsius 표면 온도 [°C]
 * @param altitudeM 고도 [m]
 * @returns 대기 밀도 [kg/m³]
 */
export function calculateAirDensity(
  temperatureCelsius: number,
  altitudeM: number
): number {
  // ISA Standard Lapse Rate: -6.5 K/km
  const LAPSE_RATE = 0.0065; // K/m
  const R = PHYSICS.R_SPECIFIC;

  // 절대 온도 계산
  const tempKelvin = temperatureCelsius + 273.15;

  // Troposphere (h <= 11km) 내에서:
  // T(h) = T₀ - L*h
  // P(h) = P₀ * (T(h)/T₀)^(-g/(R*L))

  // 온도 계산
  const tempAtAltitude = tempKelvin - LAPSE_RATE * altitudeM;

  if (tempAtAltitude <= 0) {
    // 온도가 절대 영도 이하이면 비현실적이므로 매우 낮은 밀도 반환
    return 0.01;
  }

  // 기압 계산 (Barometric formula)
  const exponent = -PHYSICS.GRAVITY / (R * LAPSE_RATE);
  const pressureAtAltitude =
    PHYSICS.ISA_PRESSURE_PA * Math.pow(tempAtAltitude / tempKelvin, exponent);

  // 밀도 계산 (이상기체법칙: ρ = P / (R_specific * T))
  const density = pressureAtAltitude / (R * tempAtAltitude);

  return Math.max(density, 0.01); // 최소 밀도 제한
}

/**
 * 테스트 케이스: ISA 표준 환경 검증
 */
export function validateAirDensity(): { passed: boolean; result: string } {
  const rho_sl = calculateAirDensity(15, 0); // 해수면, 15°C
  const expected = 1.225;
  const error = Math.abs(rho_sl - expected) / expected;

  const passed = error < 0.01; // 1% 이내 오차

  return {
    passed,
    result: `ISA SL: ${rho_sl.toFixed(4)} kg/m³ (Expected: ${expected}, Error: ${(error * 100).toFixed(2)}%)`,
  };
}
