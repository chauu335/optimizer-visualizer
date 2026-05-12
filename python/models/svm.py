"""Support Vector Machine model implementation."""

import numpy as np
from .base import Model


class SVMModel(Model):
    """
    Soft-margin Support Vector Machine with L2 regularization and hinge loss.
    """
    def __init__(self, in_dim: int, out_dim: int = 1, _lambda: float = 0.01, bias: float = 0.0):
        """
        Initialize the SVM model.
        
        Parameters:
            in_dim: Number of input features
            out_dim: Number of output dimensions (default 1 for binary classification)
            _lambda: Regularization strength (default 0.01)
            bias: Initial bias value (default 0.0)
        """
        super().__init__(in_dim, out_dim, bias)
        self._lambda = _lambda

    def _augment(self, Phi: np.ndarray) -> np.ndarray:
        """Add a column of ones to Phi for bias term."""
        n_samples = Phi.shape[0]
        bias_column = np.ones((n_samples, 1), dtype=float)
        return np.hstack((Phi, bias_column))  # Shape: (n_samples, in_dim + 1)

    def predict(self, Phi: np.ndarray) -> np.ndarray:
        """
        Make predictions on input data.
        
        Returns decision values (pre-activation).
        """
        Phi_aug = self._augment(Phi)    # Shape: (n_samples, in_dim + 1)
        return Phi_aug @ self.W         # Shape: (n_samples, out_dim)
    
    def grad(self, Phi: np.ndarray, Y: np.ndarray) -> np.ndarray:
        """
        Compute gradient of hinge loss + L2 regularization.
        
        Parameters:
            Phi: Feature matrix of shape (n_samples, in_dim)
            Y: Binary labels {-1, 1} of shape (n_samples,)
            
        Returns:
            Gradient of shape (in_dim + 1, out_dim)
        """
        Y = Y.reshape(-1, 1)  # Ensure Y is a column vector (n, 1)
        n = Phi.shape[0]
        Phi_aug = self._augment(Phi)  # (n, d+1)
        pred = Phi_aug @ self.W  # (n, out_dim)
        mask = (Y * pred < 1).astype(float)  # Hinge loss mask

        # Hinge loss gradient
        hinge_grad = -(Phi_aug.T @ (Y * mask)) / n
        
        # L2 regularization gradient (exclude bias term)
        reg = 2 * self._lambda * np.vstack((self.W[:-1], np.zeros((1, self.out_dim))))
        grad = hinge_grad + reg

        return grad
    
    def compute_loss(self, Phi: np.ndarray, Y: np.ndarray) -> float:
        """
        Compute hinge loss + L2 regularization.
        
        Parameters:
            Phi: Feature matrix of shape (n_samples, in_dim)
            Y: Binary labels {-1, 1} of shape (n_samples,)
            
        Returns:
            Scalar loss value
        """
        Y = Y.reshape(-1, 1)  # Ensure Y is a column vector (n, 1)
        Phi_aug = self._augment(Phi)
        pred = Phi_aug @ self.W
        val = 1.0 - Y * pred
        loss = np.mean(np.maximum(0, val)) + self._lambda * np.sum(self.W[:-1] ** 2)
        
        return float(loss)
