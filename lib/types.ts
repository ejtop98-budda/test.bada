// lib/types.ts

/**
 * 기체 카테고리
 */
export type VehicleCategory = 'car' | 'fighter_jet';

/**
 * 노면 상태
 */
export type SurfaceCondition = 'dry' | 'wet' | 'icy';

/**
 * 자동차 스펙
 */
export interface CarSpec {
  id: string;
  name: string;
  manufacturer: string;
  category: 'car';
  year: number;
  specs: {
    horsepower: number;
    torque: number;
    curb_weight: number;
    drivetrain: 'AWD' | 'RWD' | 'FWD';
    drag_coefficient: number;
    frontal_area: number;
    acceleration_0_100?: number;
    top_speed?: number;
  };
  imageUrl?: string;
}

/**
 * 전투기 스펙
 */
export interface JetSpec {
  id: string;
  name: string;
  manufacturer: string;
  category: 'fighter_jet';
  year: number;
  specs: {
    dry_thrust: number;
    wet_thrust: number;
    empty_weight: number;
    takeoff_weight: number;
    max_loaded_weight: number;
    drag_coefficient: number;
    wing_area: number;
    takeoff_speed: number;
    max_speed: number;
    runway_length: number;
  };
  imageUrl?: string;
}

export type VehicleSpec = CarSpec | JetSpec;

/**
 * 환경 설정
 */
export interface EnvironmentConfig {
  temperature: number; // °C
  altitude: number; // m
  surface_condition: SurfaceCondition;
  air_density: number; // kg/m³
}

/**
 * 시뮬레이션 결과
 */
export interface SimulationResult {
  vehicle_id: string;
  vehicle_name: string;
  category: VehicleCategory;
  
  // 시간 데이터
  time_array: number[]; // sec
  distance_array: number[]; // m
  velocity_array: number[]; // km/h
  acceleration_array: number[]; // m/s²
  g_force_array: number[]; // G
  
  // 주요 마일스톤
  time_0_to_100?: number; // sec
  time_quarter_mile?: number; // sec (400m)
  time_1_km?: number; // sec
  time_takeoff?: number; // sec (전투기 전용)
  
  // 최종 상태
  final_velocity: number; // km/h
  final_distance: number; // m
  runway_distance?: number; // m (전투기 전용)
  simulation_duration: number; // sec
}

/**
 * 비교 결과
 */
export interface ComparisonResult {
  vehicle_1: SimulationResult;
  vehicle_2: SimulationResult;
  winner?: string;
  winner_metric?: string;
}

/**
 * 커스텀 설정
 */
export interface CustomSettings {
  vehicle_1_multiplier: number; // 0.8 ~ 1.5
  vehicle_2_multiplier: number; // 0.8 ~ 1.5
  use_afterburner?: boolean;
}
