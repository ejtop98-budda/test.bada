// app/api/vehicles/route.ts

import { NextResponse } from 'next/server';
import { VEHICLE_DATABASE } from '@/lib/constants';

export async function GET() {
  return NextResponse.json({
    cars: VEHICLE_DATABASE.cars,
    jets: VEHICLE_DATABASE.jets,
  });
}
