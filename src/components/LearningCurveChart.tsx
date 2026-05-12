import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { OptimizationResult, ChartDataPoint } from "../types";
import { getConvergenceEpoch } from "../utils/metrics";

interface LearningCurveChartProps {
  result: OptimizationResult;
  currentEpoch?: number;
}

type MetricType = "accuracy" | "loss";

/**
 * Learning curve visualization for a single optimizer-kernel combination
 */
export function LearningCurveChart({
  result,
  currentEpoch = 100,
}: LearningCurveChartProps) {
  const [metricType, setMetricType] = useState<MetricType>("accuracy");
  // Transform epoch data into chartable format
  const allData: ChartDataPoint[] =
    result.training_metrics.train_accuracy_per_epoch.map((_, epoch) => ({
      epoch: epoch + 1,
      train_accuracy: result.training_metrics.train_accuracy_per_epoch[epoch],
      val_accuracy: result.training_metrics.val_accuracy_per_epoch[epoch],
      train_loss: result.training_metrics.train_loss_per_epoch[epoch],
      val_loss: result.training_metrics.val_loss_per_epoch[epoch],
    }));

  // Filter data up to currentEpoch for animation
  const data = currentEpoch ? allData.slice(0, currentEpoch) : allData;

  const title = `${result.optimizer} + ${result.kernel.toUpperCase()} Kernel`;
  const yAxisLabel = metricType === "accuracy" ? "Accuracy" : "Loss";

  return (
    <div
      className="rounded-lg border p-6"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-weak)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
          {title}
        </h3>

        {/* Metric toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMetricType("accuracy");
            }}
            className="btn"
            style={{
              backgroundColor:
                metricType === "accuracy" ? "var(--color-clay)" : "transparent",
              color: metricType === "accuracy" ? "white" : "var(--text)",
              border: `1px solid var(--button-border)`,
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            Accuracy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMetricType("loss");
            }}
            className="btn"
            style={{
              backgroundColor:
                metricType === "loss" ? "var(--color-clay)" : "transparent",
              color: metricType === "loss" ? "white" : "var(--text)",
              border: `1px solid var(--button-border)`,
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            Loss
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-weak)" />
          <XAxis
            dataKey="epoch"
            stroke="var(--muted)"
            label={{
              value: "Epoch",
              position: "insideBottomRight",
              offset: -5,
            }}
          />
          <YAxis
            stroke="var(--muted)"
            label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
            domain={metricType === "accuracy" ? [0, 1] : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card-bg)",
              border: `1px solid var(--border-weak)`,
              borderRadius: "6px",
            }}
            labelStyle={{ color: "var(--text)" }}
            formatter={(value: any) =>
              typeof value === "number" ? value.toFixed(4) : value
            }
          />
          <Legend />
          {metricType === "accuracy" ? (
            <>
              <Line
                type="monotone"
                dataKey="train_accuracy"
                stroke="var(--color-blue)"
                dot={false}
                isAnimationActive={false}
                name="Train Accuracy"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="val_accuracy"
                stroke="var(--color-green)"
                dot={false}
                isAnimationActive={false}
                name="Val Accuracy"
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="train_loss"
                stroke="var(--color-blue)"
                dot={false}
                isAnimationActive={false}
                name="Train Loss"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="val_loss"
                stroke="var(--color-green)"
                dot={false}
                isAnimationActive={false}
                name="Val Loss"
                strokeWidth={2}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
      {/* Final metrics summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          className="rounded p-3"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Best Val Acc
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--color-green)" }}
          >
            {/* Show the best (maximum) validation accuracy achieved during training */}
            {allData.length > 0
              ? (Math.max(...allData.map((d) => d.val_accuracy)) * 100).toFixed(
                  2,
                )
              : "0.00"}
            %
          </p>
        </div>
        <div
          className="rounded p-3"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Convergence
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--color-amber)" }}
          >
            {getConvergenceEpoch(result)} epochs
          </p>
        </div>
        <div
          className="rounded p-3"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Train Time
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--color-purple)" }}
          >
            {result.training_metrics.train_time_seconds.toFixed(1)}s
          </p>
        </div>
      </div>
    </div>
  );
}
