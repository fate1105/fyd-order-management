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

const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
};

export default function RevenueChart({ data = [] }) {
  const readTokens = () => ({
    text: cssVar("--text", "rgba(255,255,255,0.88)"),
    muted: cssVar("--muted", "rgba(255,255,255,0.62)"),
    grid: cssVar("--grid", "rgba(255,255,255,0.10)"),
    accent: cssVar("--accent", "#4bf0c8"),
    fill: cssVar("--chartFill", "rgba(75,240,200,0.16)")
  });

  const [t, setT] = useState(readTokens);

  // Bắt khi đổi theme (data-theme/class đổi)
  useEffect(() => {
    const obs = new MutationObserver(() => setT(readTokens()));
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => obs.disconnect();
  }, []);

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
            color: cssVar("--chartTickX", "rgba(255,255,255,0.65)"),
            font: { size: 12, weight: "600" }
            },
            grid: { display: false }
        },
        y: {
            ticks: {
            color: cssVar("--chartTick", "rgba(255,255,255,0.75)"),
            font: { size: 12, weight: "600" },
            callback: (v) => v.toLocaleString("vi-VN") + "đ"
            },
            grid: {
            color: cssVar("--chartGrid", "rgba(255,255,255,0.10)")
            }
        }
    }

  }), [t]);

  return (
    <div style={{ height: 260 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
