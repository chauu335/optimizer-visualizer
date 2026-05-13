/**
 * Utility functions for analyzing optimization results
 */
import { OptimizationResult } from '../types';

/**
 * Calculate epochs needed to reach a target accuracy
 */
export function getConvergenceEpoch(
  result: OptimizationResult,
  targetAccuracy: number = 0.9
): number {
  const accuracies = result.training_metrics.val_accuracy_per_epoch;
  const totalEpochs = result.training_metrics.epochs;

  if (accuracies.length === 0) return totalEpochs;

  const minEpochForConvergence = 8;
  const sustainWindow = 5;
  const maxWindowDrop = 0.02;
  const plateauDelta = 0.002;

  const windowMin = (arr: number[]) => arr.reduce((a, b) => (a < b ? a : b), arr[0]);
  const windowMax = (arr: number[]) => arr.reduce((a, b) => (a > b ? a : b), arr[0]);

  // Prefer sustained target attainment over one-off spikes.
  for (let start = minEpochForConvergence - 1; start + sustainWindow <= accuracies.length; start += 1) {
    const window = accuracies.slice(start, start + sustainWindow);
    const sustained = window.every((acc) => acc >= targetAccuracy);
    const stable = windowMax(window) - windowMin(window) <= maxWindowDrop;
    if (sustained && stable) {
      return start + 1;
    }
  }

  // Fallback: plateau detection if target isn't reached sustainably.
  for (let i = minEpochForConvergence; i < accuracies.length; i += 1) {
    const prev = accuracies[i - sustainWindow];
    const now = accuracies[i];
    const improvement = now - prev;
    const localWindow = accuracies.slice(i - sustainWindow + 1, i + 1);
    const localOscillation = windowMax(localWindow) - windowMin(localWindow);
    if (improvement <= plateauDelta && localOscillation <= maxWindowDrop) {
      return i + 1;
    }
  }

  return totalEpochs;
}

/**
 * Calculate overfitting metric (val_acc - train_acc gap)
 * Negative = underfitting, 0 = perfect, positive = overfitting
 */
export function getOverfittingGap(result: OptimizationResult): number {
  const finalTrainAcc = result.final_metrics.train_accuracy;
  const finalValAcc = result.final_metrics.val_accuracy;
  return finalTrainAcc - finalValAcc;
}

/**
 * Classify overfitting level
 */
export function getOverfittingLevel(
  gap: number
): 'good' | 'warning' | 'critical' {
  if (gap < 0.05) return 'good';
  if (gap < 0.15) return 'warning';
  return 'critical';
}

/**
 * Get color for overfitting visualization
 */
export function getOverfittingColor(level: 'good' | 'warning' | 'critical'): string {
  switch (level) {
    case 'good':
      return '#10b981'; // green
    case 'warning':
      return '#f59e0b'; // amber
    case 'critical':
      return '#ef4444'; // red
  }
}

/**
 * Optimizer descriptions and explanations
 */
export const optimizerInfo: Record<string, { name: string; description: string; advantages: string[] }> = {
  Adagrad: {
    name: 'Adagrad',
    description:
      'Adaptive Gradient Descent. Adagrad adapts the learning rate for each parameter by accumulating the sum of squared gradients over time. This means parameters that receive infrequent updates get larger steps, while frequently updated parameters slow down.',
    advantages: [
      'Good for sparse data',
      'Handles varying feature scales',
      'Learning rate naturally decays',
    ],
  },
  RMSProp: {
    name: 'RMSProp',
    description:
      'Root Mean Square Propagation. RMSProp improves on Adagrad by using an exponential moving average of squared gradients, rather than a cumulative sum. This prevents the learning rate from decaying too quickly.',
    advantages: [
      'Prevents learning rate collapse',
      'Good for non-stationary problems',
      'Often faster than Adagrad',
    ],
  },
  Adam: {
    name: 'Adam',
    description:
      'Adaptive Moment Estimation. Adam combines the ideas of momentum (averaging past gradients) and RMSProp (adaptive learning rates). It keeps track of both the mean and variance of gradients, with bias correction.',
    advantages: [
      'Fast convergence',
      'Robust across many problems',
      'Built-in bias correction',
    ],
  },
  KieferWolfowitz: {
    name: 'Kiefer-Wolfowitz',
    description:
      'Stochastic approximation method. Estimates gradients through finite differences without explicit gradient computation.',
    advantages: [
      'Works without gradients',
      'Robust to noise',
      'Gradient-free optimization',
    ],
  },
};
