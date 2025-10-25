import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function PerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return <p>No performance data available yet.</p>;
  }

  const chartData = data.map(item => ({
    week: `Week ${item.week_number}`,
    grade: item.avg_grade ? item.avg_grade.toFixed(1) : null,
    completion: item.completion_rate ? (item.completion_rate * 100).toFixed(0) : null
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="grade" 
          stroke="#8884d8" 
          name="Average Grade (%)"
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="completion" 
          stroke="#82ca9d" 
          name="Completion Rate (%)"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PerformanceChart;