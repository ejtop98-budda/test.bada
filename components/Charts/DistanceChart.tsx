// components/Charts/DistanceChart.tsx

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DistanceChartProps {
  data1_time: number[];
  data1_distance: number[];
  data1_name: string;
  data2_distance: number[];
  data2_name: string;
}

export function DistanceChart({ data1_time, data1_distance, data1_name, data2_distance, data2_name }: DistanceChartProps) {
  const data = data1_time.map((time, idx) => ({
    time: time.toFixed(2),
    [data1_name]: (data1_distance[idx] || 0) / 1000, // km로 변환
    [data2_name]: (data2_distance[idx] || 0) / 1000,
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Time (sec)', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0b1219',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(value: any) => value.toFixed(2)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={data1_name}
            stroke="#ff6b6b"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey={data2_name}
            stroke="#4ecdc4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
