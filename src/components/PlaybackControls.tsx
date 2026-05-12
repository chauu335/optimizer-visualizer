import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface PlaybackControlsProps {
  currentEpoch: number;
  maxEpochs: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onEpochChange: (epoch: number) => void;
  onSpeedChange: (speed: number) => void;
}

/**
 * Playback controls for animation
 */
export function PlaybackControls({
  currentEpoch,
  maxEpochs,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onReset,
  onEpochChange,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div
      className="rounded-lg border p-6 mb-8"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-weak)",
      }}
    >
      <div className="space-y-6">
        {/* Progress Display */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">
              Animation Progress
            </h3>
            <span className="text-sm text-slate-400">
              Epoch {currentEpoch} / {maxEpochs}
            </span>
          </div>
          <div
            className="rounded-full h-2 overflow-hidden"
            style={{ backgroundColor: "rgba(34,34,30,0.06)" }}
          >
            <div
              className="h-full transition-all duration-100 accent-gradient"
              style={{ width: `${(currentEpoch / maxEpochs) * 100}%` }}
            />
          </div>
        </div>

        {/* Epoch Scrubber */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Jump to Epoch
          </label>
          <input
            type="range"
            min="1"
            max={maxEpochs}
            value={currentEpoch}
            onChange={(e) => onEpochChange(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: "var(--color-clay)" }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex gap-4 items-center justify-between flex-wrap">
          {/* Play/Pause Buttons */}
          <div className="flex gap-3">
            <button
              onClick={isPlaying ? onPause : onPlay}
              disabled={currentEpoch >= maxEpochs}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${isPlaying ? "btn-selected" : "btn"}`}
              style={
                currentEpoch >= maxEpochs
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : undefined
              }
            >
              {isPlaying ? (
                <>
                  <Pause size={18} /> Pause
                </>
              ) : (
                <>
                  <Play size={18} /> Play
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold btn"
            >
              <RotateCcw size={18} /> Reset
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Speed:</label>
            <div className="flex gap-2">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onSpeedChange(s)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${speed === s ? "btn-selected" : "btn"}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
