import React, { useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw } from "lucide-react";

interface DataPoint {
  x: number;
  y: number;
  label: number;
}

interface DatasetData {
  points: DataPoint[];
  metadata: {
    total_samples: number;
    features_shown: string;
    classes: number[];
    class_labels: Record<string, string>;
  };
}

interface SampledPoint extends DataPoint {
  jitter?: number; // For visualization clarity
}

const DatasetVisualizer: React.FC = () => {
  const [allPoints, setAllPoints] = useState<DataPoint[]>([]);
  const [sampledPoints, setSampledPoints] = useState<SampledPoint[]>([]);
  const [sampleSize, setSampleSize] = useState(250);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>(null);

  // Load dataset from JSON file
  useEffect(() => {
    const loadDataset = async () => {
      try {
        const response = await fetch("/data/dataset.json");
        const data: DatasetData = await response.json();
        setAllPoints(data.points);
        setMetadata(data.metadata);
        // Generate initial sample
        generateSample(data.points, 250);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load dataset:", error);
        setLoading(false);
      }
    };

    loadDataset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate random sample from all points
  const generateSample = (points: DataPoint[], size: number) => {
    if (points.length === 0) return;

    // Randomly shuffle and pick top 'size' points
    const shuffled = [...points].sort(() => Math.random() - 0.5);
    const sampled = shuffled.slice(0, Math.min(size, points.length));

    setSampledPoints(sampled);
  };

  const handleResample = () => {
    generateSample(allPoints, sampleSize);
  };

  const handleSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setSampleSize(newSize);
    generateSample(allPoints, newSize);
  };

  if (loading || !metadata) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Loading dataset...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Dataset Visualization
        </h2>
        <p className="text-sm text-gray-600">
          {metadata.features_shown} • Total samples: {metadata.total_samples}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <label
            htmlFor="sampleSize"
            className="text-sm font-medium text-gray-700"
          >
            Show:
          </label>
          <input
            id="sampleSize"
            type="range"
            min="50"
            max={Math.min(500, allPoints.length)}
            step="50"
            value={sampleSize}
            onChange={handleSampleSizeChange}
            className="w-32"
          />
          <span className="text-sm text-gray-600 font-medium min-w-12">
            {sampledPoints.length}
          </span>
        </div>

        <button
          onClick={handleResample}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors text-sm font-medium"
          style={{ backgroundColor: "var(--color-clay)" }}
        >
          <RotateCcw size={16} />
          Resample
        </button>
      </div>

      {/* Scatter Plot */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="x"
              label={{
                value: "Feature 1",
                position: "insideBottomRight",
                offset: -5,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              label={{ value: "Feature 2", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
              }}
            />
            <Legend />

            {/* Class -1 (negative class) */}
            <Scatter
              name="Class -1"
              data={sampledPoints.filter((p) => p.label === -1)}
              fill="#ef4444"
              fillOpacity={0.7}
              shape="circle"
            />

            {/* Class +1 (positive class) */}
            <Scatter
              name="Class +1"
              data={sampledPoints.filter((p) => p.label === 1)}
              fill="#3b82f6"
              fillOpacity={0.7}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Showing {sampledPoints.length} of {allPoints.length} total samples
      </div>
    </div>
  );
};

export default DatasetVisualizer;
