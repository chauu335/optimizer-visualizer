import React from "react";
import { X } from "lucide-react";
import { optimizerInfo } from "../utils/metrics";

interface OptimizerInfoPanelProps {
  optimizerName: string | null;
  onClose: () => void;
}

export function OptimizerInfoPanel({
  optimizerName,
  onClose,
}: OptimizerInfoPanelProps) {
  if (!optimizerName || !optimizerInfo[optimizerName]) {
    return null;
  }

  const info = optimizerInfo[optimizerName];

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md shadow-2xl transform transition-transform duration-300 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--card-bg)",
          borderLeft: "1px solid var(--border-weak)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 flex justify-between items-center"
          style={{
            borderBottom: "1px solid var(--border-weak)",
            backgroundColor: "var(--card-bg)",
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            {info.name}
          </h2>
          <button onClick={onClose} style={{ color: "var(--muted)" }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--color-blue)" }}
            >
              What is {info.name}?
            </h3>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
              {info.description}
            </p>
          </div>

          {/* Advantages */}
          <div>
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--color-green)" }}
            >
              Advantages
            </h3>
            <ul className="space-y-2">
              {info.advantages.map((adv, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3"
                  style={{ color: "var(--muted)" }}
                >
                  <span
                    style={{
                      color: "var(--color-green)",
                      fontWeight: 700,
                      marginTop: 6,
                    }}
                  >
                    ✓
                  </span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Rate Info */}
          <div>
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--color-purple)" }}
            >
              Common Hyperparameters
            </h3>
            <dl className="space-y-3 text-sm">
              {optimizerName === "Adam" && (
                <>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Learning Rate (lr)
                    </dt>
                    <dd className="text-slate-300">
                      0.001 (typical range: 0.0001 - 0.01)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Beta 1 (momentum)
                    </dt>
                    <dd className="text-slate-300">
                      0.9 (exponential decay rate)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Beta 2 (RMS decay)
                    </dt>
                    <dd className="text-slate-300">
                      0.999 (exponential decay rate)
                    </dd>
                  </div>
                </>
              )}
              {optimizerName === "Adagrad" && (
                <>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Learning Rate (lr)
                    </dt>
                    <dd className="text-slate-300">
                      0.01 (typical range: 0.001 - 0.1)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-semibold">Epsilon</dt>
                    <dd className="text-slate-300">
                      1e-8 (numerical stability)
                    </dd>
                  </div>
                </>
              )}
              {optimizerName === "RMSProp" && (
                <>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Learning Rate (lr)
                    </dt>
                    <dd className="text-slate-300">
                      0.001 (typical range: 0.0001 - 0.01)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Decay Rate (beta)
                    </dt>
                    <dd className="text-slate-300">
                      0.99 (moving average decay)
                    </dd>
                  </div>
                </>
              )}
              {optimizerName === "KieferWolfowitz" && (
                <>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Learning Rate (lr_a)
                    </dt>
                    <dd className="text-slate-300">
                      Step size (decreases over time)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400 font-semibold">
                      Perturbation (lr_c)
                    </dt>
                    <dd className="text-slate-300">
                      Finite difference step size
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Use Cases */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--color-amber)" }}
            >
              Best For
            </h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {optimizerName === "Adam"
                ? "Most deep learning tasks, default choice for many practitioners"
                : optimizerName === "Adagrad"
                  ? "Sparse gradients, natural language processing, recommendation systems"
                  : optimizerName === "RMSProp"
                    ? "Non-stationary problems, RNNs, when learning rate decay is needed"
                    : "Gradient-free optimization, black-box functions, robust applications"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
