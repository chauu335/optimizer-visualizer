/**
 * Type definitions matching the Python results.json structure
 */

export interface TrainingMetrics {
  epochs: number;
  train_accuracy_per_epoch: number[];
  val_accuracy_per_epoch: number[];
  train_loss_per_epoch: number[];
  val_loss_per_epoch: number[];
  train_time_seconds: number;
}

export interface FinalMetrics {
  train_accuracy: number;
  val_accuracy: number;
  train_loss: number;
  val_loss: number;
}

export interface OptimizationResult {
  optimizer: string;
  kernel: string;
  hyperparameters: {
    optimizer: Record<string, number | string>;
    kernel: Record<string, number | string>;
  };
  training_metrics: TrainingMetrics;
  final_metrics: FinalMetrics;
}

export interface Metadata {
  dataset_info: string;
  n_samples: number;
  n_features: number;
  train_ratio: number;
  epochs: number;
  timestamp: string;
}

export interface ResultsData {
  results: OptimizationResult[];
  metadata: Metadata;
}

/**
 * Chart data point (for easier graphing)
 */
export interface ChartDataPoint {
  epoch: number;
  train_accuracy: number;
  val_accuracy: number;
  train_loss: number;
  val_loss: number;
}

export {}; // Make this a module for TypeScript
