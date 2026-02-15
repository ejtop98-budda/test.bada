// lib/constants.ts

import { CarSpec, JetSpec } from './types';

/**
 * 물리 상수
 */
export const PHYSICS = {
  GRAVITY: 9.81, // m/s²
  R_SPECIFIC: 287.05, // J/(kg·K)
  ISA_TEMP_KELVIN: 288.15, // 15°C
  ISA_PRESSURE_PA: 101325,
  ISA_DENSITY: 1.225, // kg/m³
};

/**
 * 시뮬레이션 설정
 */
export const SIMULATION = {
  DT: 0.01, // sec
  MAX_TIME: 120, // sec
  ACCEL_THRESHOLD: 0.01, // m/s²
};

/**
 * 환경 범위
 */
export const ENVIRONMENT_RANGES = {
  temperature: { min: -40, max: 60, step: 5 },
  altitude: { min: 0, max: 5000, step: 500 },
};

/**
 * 기본 기체 데이터 (내장)
 */
export const VEHICLE_DATABASE = {
  cars: [
    {
      id: 'bugatti_chiron',
      name: 'Bugatti Chiron',
      manufacturer: 'Bugatti',
      category: 'car' as const,
      year: 2016,
      specs: {
        horsepower: 1500,
        torque: 1600,
        curb_weight: 1995,
        drivetrain: 'AWD' as const,
        drag_coefficient: 0.34,
        frontal_area: 2.4,
        acceleration_0_100: 2.4,
        top_speed: 420,
      },
      imageUrl: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: 'tesla_model_s_plaid',
      name: 'Tesla Model S Plaid',
      manufacturer: 'Tesla',
      category: 'car' as const,
      year: 2021,
      specs: {
        horsepower: 1020,
        torque: 1620,
        curb_weight: 2150,
        drivetrain: 'AWD' as const,
        drag_coefficient: 0.208,
        frontal_area: 2.197,
        acceleration_0_100: 2.15,
        top_speed: 322,
      },
      imageUrl: 'https://images.pexels.com/photos/5592343/pexels-photo-5592343.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: 'lamborghini_aventador',
      name: 'Lamborghini Aventador',
      manufacturer: 'Lamborghini',
      category: 'car' as const,
      year: 2011,
      specs: {
        horsepower: 740,
        torque: 690,
        curb_weight: 1575,
        drivetrain: 'AWD' as const,
        drag_coefficient: 0.33,
        frontal_area: 2.5,
        acceleration_0_100: 2.9,
        top_speed: 350,
      },
      imageUrl: 'https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ] as CarSpec[],

  jets: [
    {
      id: 'f16_viper',
      name: 'F-16 Fighting Falcon',
      manufacturer: 'General Dynamics',
      category: 'fighter_jet' as const,
      year: 1978,
      specs: {
        dry_thrust: 109,
        wet_thrust: 156,
        empty_weight: 7700,
        takeoff_weight: 16330,
        max_loaded_weight: 21320,
        drag_coefficient: 0.025,
        wing_area: 27.87,
        takeoff_speed: 260,
        max_speed: 2124,
        runway_length: 2400,
      },
      imageUrl: 'https://images.pexels.com/photos/1161547/pexels-photo-1161547.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: 'f15_eagle',
      name: 'F-15 Eagle',
      manufacturer: 'McDonnell Douglas',
      category: 'fighter_jet' as const,
      year: 1972,
      specs: {
        dry_thrust: 65.3,
        wet_thrust: 100.6,
        empty_weight: 13054,
        takeoff_weight: 20610,
        max_loaded_weight: 30844,
        drag_coefficient: 0.025,
        wing_area: 56.5,
        takeoff_speed: 280,
        max_speed: 2663,
        runway_length: 1500,
      },
      imageUrl: 'https://images.pexels.com/photos/2556269/pexels-photo-2556269.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ] as JetSpec[],
};

/**
 * 타이어 마찰 계수 (노면 상태별)
 */
export const FRICTION_COEFFS = {
  dry: 1.0,
  wet: 0.75,
  icy: 0.35,
} as const;

/**
 * 구동방식별 무게 분배 (타이어 마찰 계산용)
 */
export const WEIGHT_DISTRIBUTION = {
  AWD: 1.0,
  RWD: 0.5,
  FWD: 0.55,
} as const;
