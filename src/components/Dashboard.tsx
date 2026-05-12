import React, { useState, useEffect } from "react";
import { useResults } from "../hooks/useResults";
import { LearningCurveChart } from "./LearningCurveChart";
import { PlaybackControls } from "./PlaybackControls";
import { ResultsRankings } from "./ResultsRankings";
import { FilterControls } from "./FilterControls";
import { OptimizerInfoPanel } from "./OptimizerInfoPanel";

/**
 * Main dashboard component that orchestrates the visualization
 */
export function Dashboard() {
  const { data, loading, error } = useResults();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [selectedOptimizers, setSelectedOptimizers] = useState<Set<string>>(
    new Set(),
  );
  const [selectedKernels, setSelectedKernels] = useState<Set<string>>(
    new Set(),
  );
  const [selectedOptimizerInfo, setSelectedOptimizerInfo] = useState<
    string | null
  >(null);

  const maxEpochs = data?.metadata.epochs || 100;

  // Initialize selected optimizers and kernels when data loads
  useEffect(() => {
    if (data) {
      const optimizers = new Set(data.results.map((r) => r.optimizer));
      const kernels = new Set(data.results.map((r) => r.kernel));
      setSelectedOptimizers(optimizers);
      setSelectedKernels(kernels);
    }
  }, [data]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || currentEpoch >= maxEpochs) {
      setIsPlaying(false);
      return;
    }

    const baseInterval = 50; // 50ms base interval
    const interval = baseInterval / speed;

    const timer = setInterval(() => {
      setCurrentEpoch((prev) => {
        const next = prev + 1;
        if (next > maxEpochs) {
          setIsPlaying(false);
          return maxEpochs;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, currentEpoch, maxEpochs, speed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: "var(--color-blue)" }}
            aria-hidden
          ></div>
          <p className="text-lg" style={{ color: "var(--muted)" }}>
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-2" style={{ color: "var(--color-amber)" }}>
            Error loading results
          </p>
          <p style={{ color: "var(--muted)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: "var(--muted)" }}>No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen light-theme pb-12">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--text)" }}
          >
            Optimizer Visualization
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Comparing SVM optimizers across different kernel transformations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Dataset Info */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Dataset Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
                Samples
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--color-blue)" }}
              >
                {data.metadata.n_samples}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
                Features
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--color-green)" }}
              >
                {data.metadata.n_features}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
                Train/Val Split
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--color-purple)" }}
              >
                {Math.round(data.metadata.train_ratio * 100)}% /{" "}
                {Math.round((1 - data.metadata.train_ratio) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
                Experiments
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: "var(--color-amber)" }}
              >
                {data.results.length}
              </p>
            </div>
          </div>
        </div>

        {/* Results Rankings */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Results Rankings
          </h2>
          <ResultsRankings
            results={data.results}
            onSelectOptimizer={(optimizer) => {
              const newSet = new Set(selectedOptimizers);
              if (newSet.has(optimizer)) {
                newSet.delete(optimizer);
              } else {
                newSet.add(optimizer);
              }
              setSelectedOptimizers(newSet);
            }}
          />
        </div>

        {/* Filter Controls */}
        <div
          className="rounded-lg border p-6 mb-8"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-weak)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
              Filters
            </h2>
            <button
              onClick={() => {
                setSelectedOptimizers(
                  new Set(data.results.map((r) => r.optimizer)),
                );
                setSelectedKernels(new Set(data.results.map((r) => r.kernel)));
              }}
              className="text-sm px-4 py-2"
              style={{ color: "var(--color-clay)" }}
            >
              Reset Filters
            </button>
          </div>
          <FilterControls
            optimizers={Array.from(
              new Set(data.results.map((r) => r.optimizer)),
            )}
            kernels={Array.from(new Set(data.results.map((r) => r.kernel)))}
            selectedOptimizers={selectedOptimizers}
            selectedKernels={selectedKernels}
            onOptimizerToggle={(optimizer) => {
              const newSet = new Set(selectedOptimizers);
              if (newSet.has(optimizer)) {
                newSet.delete(optimizer);
              } else {
                newSet.add(optimizer);
              }
              setSelectedOptimizers(newSet);
            }}
            onKernelToggle={(kernel) => {
              const newSet = new Set(selectedKernels);
              if (newSet.has(kernel)) {
                newSet.delete(kernel);
              } else {
                newSet.add(kernel);
              }
              setSelectedKernels(newSet);
            }}
            onSelectAll={() => {
              setSelectedOptimizers(
                new Set(data.results.map((r) => r.optimizer)),
              );
              setSelectedKernels(new Set(data.results.map((r) => r.kernel)));
            }}
            onClearAll={() => {
              setSelectedOptimizers(new Set());
              setSelectedKernels(new Set());
            }}
          />
        </div>

        {/* Playback Controls */}
        <PlaybackControls
          currentEpoch={currentEpoch}
          maxEpochs={maxEpochs}
          isPlaying={isPlaying}
          speed={speed}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onReset={() => {
            setCurrentEpoch(1);
            setIsPlaying(false);
          }}
          onEpochChange={(epoch) => {
            setCurrentEpoch(epoch);
            setIsPlaying(false);
          }}
          onSpeedChange={(newSpeed) => setSpeed(newSpeed)}
        />

        {/* Charts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Results</h2>
          {data.results.filter(
            (r) =>
              selectedOptimizers.has(r.optimizer) &&
              selectedKernels.has(r.kernel),
          ).length === 0 ? (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
              <p className="text-slate-400">
                No results match the selected filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.results
                .filter(
                  (r) =>
                    selectedOptimizers.has(r.optimizer) &&
                    selectedKernels.has(r.kernel),
                )
                .map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedOptimizerInfo(result.optimizer)}
                    className="cursor-pointer"
                  >
                    <LearningCurveChart
                      result={result}
                      currentEpoch={currentEpoch}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Generated: {new Date(data.metadata.timestamp).toLocaleString()}</p>
          <p className="mt-2">{data.metadata.dataset_info}</p>
        </div>

        {/* Optimizer Info Panel */}
        {selectedOptimizerInfo && (
          <OptimizerInfoPanel
            optimizerName={selectedOptimizerInfo}
            onClose={() => setSelectedOptimizerInfo(null)}
          />
        )}
      </main>
    </div>
  );
}
