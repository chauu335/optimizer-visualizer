import React from "react";

interface FilterControlsProps {
  optimizers: string[];
  kernels: string[];
  selectedOptimizers: Set<string>;
  selectedKernels: Set<string>;
  onOptimizerToggle: (optimizer: string) => void;
  onKernelToggle: (kernel: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function FilterControls({
  optimizers,
  kernels,
  selectedOptimizers,
  selectedKernels,
  onOptimizerToggle,
  onKernelToggle,
  onSelectAll,
  onClearAll,
}: FilterControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Optimizers */}
      <div>
        <h3
          className="text-sm font-semibold mb-3 uppercase tracking-wide"
          style={{ color: "var(--muted)" }}
        >
          Optimizers
        </h3>
        <div className="space-y-2">
          {optimizers.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedOptimizers.has(opt)}
                onChange={() => onOptimizerToggle(opt)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: "var(--color-clay)" }}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Kernels */}
      <div>
        <h3
          className="text-sm font-semibold mb-3 uppercase tracking-wide"
          style={{ color: "var(--muted)" }}
        >
          Kernels
        </h3>
        <div className="space-y-2">
          {kernels.map((kernel) => (
            <label
              key={kernel}
              className="flex items-center gap-3 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedKernels.has(kernel)}
                onChange={() => onKernelToggle(kernel)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: "var(--color-clay)" }}
              />
              <span className="capitalize">{kernel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Select All / None */}
      <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-700 flex gap-3">
        <button onClick={onSelectAll} className="px-4 py-2 text-sm rounded-lg">
          Select All
        </button>
        <button onClick={onClearAll} className="px-4 py-2 text-sm rounded-lg">
          Clear All
        </button>
      </div>
    </div>
  );
}
