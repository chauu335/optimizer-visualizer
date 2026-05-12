import React, { useState } from "react";
import { OptimizationResult } from "../types";
import { getConvergenceEpoch } from "../utils/metrics";

interface ResultsRankingsProps {
  results: OptimizationResult[];
  onSelectOptimizer: (optimizer: string) => void;
}

type SortKey = "accuracy" | "time" | "convergence";

export function ResultsRankings({
  results,
  onSelectOptimizer,
}: ResultsRankingsProps) {
  const [sortBy, setSortBy] = useState<SortKey>("accuracy");

  // Calculate metrics for all results
  const resultsWithMetrics = results.map((result) => ({
    ...result,
    convergenceEpoch: getConvergenceEpoch(result),
    bestValAccuracy: Math.max(
      ...result.training_metrics.val_accuracy_per_epoch,
    ),
  }));

  // Sort results
  const sorted = [...resultsWithMetrics].sort((a, b) => {
    switch (sortBy) {
      case "accuracy":
        return b.bestValAccuracy - a.bestValAccuracy;
      case "time":
        return (
          a.training_metrics.train_time_seconds -
          b.training_metrics.train_time_seconds
        );
      case "convergence":
        return a.convergenceEpoch - b.convergenceEpoch;
      default:
        return 0;
    }
  });

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Results Rankings</h2>

      {/* Sort Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(["accuracy", "time", "convergence"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === key ? "btn-selected" : "btn"
            }`}
          >
            {key === "accuracy"
              ? "📊 Accuracy"
              : key === "time"
                ? "⚡ Speed"
                : "🎯 Convergence"}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-400">Rank</th>
              <th className="text-left px-4 py-3 text-slate-400">Optimizer</th>
              <th className="text-left px-4 py-3 text-slate-400">Kernel</th>
              <th className="text-right px-4 py-3 text-slate-400">
                Best Val Acc
              </th>
              <th className="text-right px-4 py-3 text-slate-400">
                Conv. (epochs)
              </th>
              <th className="text-right px-4 py-3 text-slate-400">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((result, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-700 cursor-pointer transition-colors"
                onClick={() => onSelectOptimizer(result.optimizer)}
              >
                <td
                  className="px-4 py-3 font-semibold"
                  style={{ color: "var(--color-blue)" }}
                >
                  #{idx + 1}
                </td>
                <td
                  className="px-4 py-3 font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {result.optimizer}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {result.kernel}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className="font-semibold"
                    style={{ color: "var(--color-green)" }}
                  >
                    {(result.bestValAccuracy * 100).toFixed(1)}%
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ color: "var(--color-amber)" }}
                >
                  {result.convergenceEpoch}
                </td>
                <td
                  className="px-4 py-3 text-right"
                  style={{ color: "var(--color-purple)" }}
                >
                  {result.training_metrics.train_time_seconds.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
