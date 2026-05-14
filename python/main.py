"""
Main script for running optimization experiments on synthetic data.

This script orchestrates the full pipeline:
1. Generate synthetic dataset
2. Run optimizers with different kernels
3. Track metrics (accuracy, training time, convergence)
4. Export results to JSON for React visualization
"""

import json
import time
import numpy as np
from typing import Dict, List, Any
import sys
import os

# Add python directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.base import Model
from models.svm import SVMModel
from models.optimizers import Optimizer, Adagrad, RMSProp, Adam, KieferWolfowitz
from utils.trainer import Trainer
from utils.transforms import polynomial_transform, rbf_transform, select_rbf_centers
from data.generate_data import generate_synthetic_data


def stratified_split_indices(n_samples: int, train_split: float, random_seed: int):
    """
    Create stratified train/val split indices to ensure balanced classes in both sets.
    
    Parameters:
        n_samples: Total number of samples (assumes first half is class -1, second half is class +1)
        train_split: Fraction of data for training (e.g., 0.8 for 80%)
        random_seed: Random seed for reproducibility
        
    Returns:
        Tuple of (train_idx, val_idx) as numpy arrays
    """
    np.random.seed(random_seed)
    
    n_per_class = n_samples // 2
    
    # Create indices for each class
    class_neg_idx = np.arange(n_per_class)  # Class -1: indices 0 to n_per_class-1
    class_pos_idx = np.arange(n_per_class, n_samples)  # Class +1: indices n_per_class to n_samples-1
    
    # Shuffle within each class
    np.random.shuffle(class_neg_idx)
    np.random.shuffle(class_pos_idx)
    
    # Split each class into train/val
    split_point = int(n_per_class * train_split)
    
    train_neg = class_neg_idx[:split_point]
    val_neg = class_neg_idx[split_point:]
    
    train_pos = class_pos_idx[:split_point]
    val_pos = class_pos_idx[split_point:]
    
    # Combine and return
    train_idx = np.concatenate([train_neg, train_pos])
    val_idx = np.concatenate([val_neg, val_pos])
    
    return train_idx, val_idx


def run_experiment(
    optimizer_cls,
    optimizer_params: Dict[str, Any],
    kernel_type: str,
    kernel_params: Dict[str, Any],
    X_train: np.ndarray,
    Y_train: np.ndarray,
    X_val: np.ndarray,
    Y_val: np.ndarray,
    epochs: int = 100
) -> Dict[str, Any]:
    """
    Run a single optimization experiment.
    
    Parameters:
        optimizer_cls: Optimizer class (e.g., Adagrad, RMSProp, Adam, KieferWolfowitz)
        optimizer_params: Dictionary of optimizer hyperparameters
        kernel_type: 'linear', 'rbf', or 'poly'
        kernel_params: Dictionary of kernel transformation parameters
        X_train: Training features
        Y_train: Training labels
        X_val: Validation features
        Y_val: Validation labels
        epochs: Number of training epochs
        
    Returns:
        Dictionary with results including metrics and timing
    """
    
    # Apply kernel transformation
    if kernel_type == 'linear':
        X_train_transformed = X_train
        X_val_transformed = X_val
    elif kernel_type == 'rbf':
        # Extract parameters for select_rbf_centers
        n_centers = kernel_params.get('n_centers', 80)
        centers = select_rbf_centers(X_train, n_centers=n_centers)
        
        # Extract parameters for rbf_transform
        gamma = kernel_params.get('gamma', 0.1)
        X_train_transformed = rbf_transform(X_train, centers, gamma=gamma)
        X_val_transformed = rbf_transform(X_val, centers, gamma=gamma)
    elif kernel_type == 'poly':
        X_train_transformed = polynomial_transform(X_train, **kernel_params)
        X_val_transformed = polynomial_transform(X_val, **kernel_params)
    else:
        raise ValueError(f"Unknown kernel type: {kernel_type}")
    
    # Create model and optimizer
    model = SVMModel(in_dim=X_train_transformed.shape[1])
    optimizer = optimizer_cls(**optimizer_params)
    trainer = Trainer(model, optimizer)
    
    # Train and measure time
    start_time = time.time()
    trainer.fit(X_train_transformed, Y_train, X_val_transformed, Y_val, epochs=epochs)
    training_time = time.time() - start_time
    
    return {
        'optimizer': optimizer_cls.__name__,
        'kernel': kernel_type,
        'hyperparameters': {
            'optimizer': optimizer_params,
            'kernel': kernel_params,
        },
        'training_metrics': {
            'epochs': epochs,
            'train_accuracy_per_epoch': trainer.history['train_accuracy'],
            'val_accuracy_per_epoch': trainer.history['val_accuracy'],
            'train_loss_per_epoch': trainer.history['train_loss'],
            'val_loss_per_epoch': trainer.history['val_loss'],
            'train_time_seconds': training_time,
        },
        'final_metrics': {
            'train_accuracy': float(trainer.history['train_accuracy'][-1]),
            'val_accuracy': float(trainer.history['val_accuracy'][-1]),
            'train_loss': float(trainer.history['train_loss'][-1]),
            'val_loss': float(trainer.history['val_loss'][-1]),
        }
    }


def main():
    """
    Main function to run all experiments and export results.
    """
    
    print("Optimizer Visualization Pipeline")
    print("=" * 50)
    
    # Configuration
    EPOCHS = 100
    RANDOM_SEED = 42
    TRAIN_SPLIT = 0.8
    
    print("\n1. Generating synthetic dataset...")
    X, y = generate_synthetic_data(n_samples=500, n_features=50, random_state=RANDOM_SEED)
    
    # Get dataset dimensions
    n_samples, n_features = X.shape
    
    # Split data with stratification to balance classes in train and val sets
    train_idx, val_idx = stratified_split_indices(n_samples, TRAIN_SPLIT, RANDOM_SEED)
    X_train, X_val = X[train_idx], X[val_idx]
    Y_train, Y_val = y[train_idx], y[val_idx]
    
    print(f"   Dataset: {n_samples} samples, {n_features} features")
    print(f"   Train/Val split: {len(train_idx)}/{len(val_idx)}")
    
    # Define optimizers and their hyperparameters
    optimizer_configs = [
        (Adagrad, {'lr': 0.01}),
        (RMSProp, {'lr': 0.001}),
        (Adam, {'lr': 0.001}),
        (KieferWolfowitz, {'lr_a': 1.0, 'lr_c': 1.0}),
    ]
    
    # Define kernels and their parameters
    kernel_configs = [
        ('linear', {}),
        ('rbf', {'n_centers': 80, 'gamma': 0.1}),
        ('poly', {'degree': 2, 'include_bias': False, 'interaction_only': True}),
    ]
    
    # Run all experiments
    print("\n2. Running optimization experiments...")
    results = []
    total_experiments = len(optimizer_configs) * len(kernel_configs)
    current = 0
    
    for opt_cls, opt_params in optimizer_configs:
        for kernel_type, kernel_params in kernel_configs:
            current += 1
            print(f"   [{current}/{total_experiments}] {opt_cls.__name__} + {kernel_type}...")
            
            try:
                result = run_experiment(
                    opt_cls, opt_params,
                    kernel_type, kernel_params,
                    X_train, Y_train, X_val, Y_val,
                    epochs=EPOCHS
                )
                results.append(result)
            except Exception as e:
                print(f"       ERROR: {e}")
    
    # Export results to JSON
    print("\n3. Exporting results...")
    output_data = {
        'results': results,
        'metadata': {
            'dataset_info': 'Synthetic features and binary labels',
            'n_samples': n_samples,
            'n_features': n_features,
            'train_ratio': TRAIN_SPLIT,
            'epochs': EPOCHS,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        }
    }
    
    # Output to public/data directory for React to access
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'results.json')
    
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"   Results saved to {output_file}")
    
    # Also export dataset for visualization (first 2 features + labels)
    print("\n3b. Exporting dataset for visualization...")
    dataset_data = {
        'points': [
            {
                'x': float(X[i, 0]),
                'y': float(X[i, 1]),
                'label': int(y[i])
            }
            for i in range(len(X))
        ],
        'metadata': {
            'total_samples': len(X),
            'features_shown': 'First 2 of 50 features',
            'classes': [-1, 1],
            'class_labels': {'-1': 'Class -1', '1': 'Class +1'}
        }
    }
    
    dataset_file = os.path.join(output_dir, 'dataset.json')
    with open(dataset_file, 'w') as f:
        json.dump(dataset_data, f, indent=2)
    
    print(f"   Dataset saved to {dataset_file}")
    print("\n" + "=" * 50)
    print(f"Pipeline complete! Generated {len(results)} experiments.")
    print(f"Results ready for React visualization in {output_dir}")


if __name__ == '__main__':
    main()
