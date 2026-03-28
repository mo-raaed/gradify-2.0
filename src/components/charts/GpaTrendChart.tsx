import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Semester } from "@/lib/gpaCalculator";
import { useState, useEffect } from "react";

interface GpaTrendChartProps {
  semesters: Semester[];
}

export function GpaTrendChart({ semesters }: GpaTrendChartProps) {
  // Detect dark mode from document root classes
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
             (window.matchMedia("(prefers-color-scheme: dark)").matches &&
              !document.documentElement.classList.contains("light"));
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkMode = document.documentElement.classList.contains("dark") ||
                       (window.matchMedia("(prefers-color-scheme: dark)").matches &&
                        !document.documentElement.classList.contains("light"));
      setIsDark(darkMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Prepare data for chart - only completed semesters
  const chartData = semesters
    .filter((s) => s.planned !== true)
    .map((semester) => ({
      name: semester.name,
      semesterGPA: semester.semesterGPA,
      cumulativeGPA: semester.cumulativeGPA,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <p className="text-sm text-muted-foreground">
          Complete some courses to see your GPA trend
        </p>
      </div>
    );
  }

  // Color scheme
  const colors = {
    cumulative: isDark ? "#81aeff" : "#056380",
    semester: isDark ? "#8fd5f7" : "#8fd5f7",
    grid: isDark ? "rgba(67, 72, 79, 0.2)" : "rgba(136, 179, 206, 0.2)",
    text: isDark ? "#a7abb4" : "#356079",
  };

  // Abbreviate semester names for chart (e.g., "2024/25 Fall" → "F24")
  const abbreviateName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      const term = parts[parts.length - 1]; // "Fall", "Spring", etc.
      const year = parts[0]; // "2024/25"
      const shortYear = year.includes("/") ? year.split("/")[0].slice(-2) : year.slice(-2);
      return `${term.charAt(0)}${shortYear}`;
    }
    return name.length > 6 ? name.slice(0, 6) : name;
  };

  return (
    <div className="w-full h-full min-h-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">GPA Trend</h3>
      </div>
      <ResponsiveContainer width="100%" height="100%" minHeight={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey="name"
            tick={{ fill: colors.text, fontSize: 11 }}
            tickLine={{ stroke: colors.grid }}
            axisLine={{ stroke: colors.grid }}
            tickFormatter={abbreviateName}
          />
          <YAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fill: colors.text, fontSize: 11 }}
            tickLine={{ stroke: colors.grid }}
            axisLine={{ stroke: colors.grid }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1a2028" : "#ffffff",
              border: isDark ? "1px solid rgba(67, 72, 79, 0.15)" : "1px solid rgba(136, 179, 206, 0.15)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            labelStyle={{ color: isDark ? "#e1e5ee" : "#003348", fontWeight: 500 }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="cumulativeGPA"
            name="Cumulative GPA"
            stroke={colors.cumulative}
            strokeWidth={2}
            dot={{ fill: colors.cumulative, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="semesterGPA"
            name="Semester GPA"
            stroke={colors.semester}
            strokeWidth={2}
            dot={{ fill: colors.semester, r: 4 }}
            activeDot={{ r: 6 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
