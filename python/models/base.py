"""Base Model class for machine learning models."""

from abc import ABC, abstractmethod
import numpy as np
from typing import Tuple


class Model(ABC):
    """Abstract base class for all models."""
    
    def __init__(self,
                 in_dim: int,
                 out_dim: int = 1,
                 bias: float = 0.0):
        """
        Initialize the model.
        
        Parameters:
            in_dim: Number of input features
            out_dim: Number of output dimensions (default 1 for binary classification)
            bias: Initial bias value (default 0.0)
        """
        self.in_dim = in_dim
        self.out_dim = out_dim
        self.W = np.zeros((in_dim + 1, out_dim), dtype=float)   # Weights + bias
        self.W[-1, :] = bias  # Set initial bias value

    @abstractmethod
    def _augment(self, Phi: np.ndarray) -> np.ndarray:
        """Add bias column to feature matrix."""
        raise NotImplementedError("Must be implemented by subclass.")

    @abstractmethod
    def predict(self, Phi: np.ndarray) -> np.ndarray:
        """Make predictions on input data."""
        raise NotImplementedError("Must be implemented by subclass.")
    
    @abstractmethod
    def grad(self, Phi: np.ndarray, Y: np.ndarray) -> np.ndarray:
        """Compute gradient of loss with respect to weights."""
        raise NotImplementedError("Must be implemented by subclass.")
    
    @abstractmethod
    def compute_loss(self, Phi: np.ndarray, Y: np.ndarray) -> float:
        """Compute loss on data."""
        raise NotImplementedError("Must be implemented by subclass.")
