import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function RevenueChart({ data = [] }) {
  // Use fixed light theme colors for admin
  const t = {
    text: "#000",
    muted: "#767677",
    grid: "#e5e5e5",
    accent: "#000",
    fill: "rgba(0,0,0,0.08)"
  };

  const chartData = useMemo(() => ({
    labels: data.map(i => i.label),
    datasets: [{
      data: data.map(i => i.value),
      borderColor: t.accent,
      backgroundColor: t.fill,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: t.accent
    }]
  }), [data, t]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: {
            ticks: {
            color: "#767677",
            font: { size: 12, weight: "600" }
            },
            grid: { display: false }
        },
        y: {
            ticks: {
            color: "#767677",
            font: { size: 12, weight: "600" },
            callback: (v) => v.toLocaleString("vi-VN") + "đ"
            },
            grid: {
            color: "#e5e5e5"
            }
        }
    }
  }), []);

  return (
    <div style={{ height: 260 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
