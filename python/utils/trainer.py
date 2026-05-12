"""Training loop for models."""

import numpy as np
from typing import Dict, List
from models.base import Model
from models.optimizers import Optimizer, KieferWolfowitz


class Trainer:
    """
    Trainer class for training models with optimizers.
    Tracks training and validation metrics during training.
    """
    
    def __init__(self, model: Model, optimizer: Optimizer):
        """
        Initialize trainer.
        
        Parameters:
            model: Model to train
            optimizer: Optimizer for training
        """
        self.model = model
        self.optimizer = optimizer
        
        self.history = {
            "train_loss": [],
            "train_accuracy": [],
            "val_loss": [],
            "val_accuracy": []
        }

    def fit(self, 
            Phi: np.ndarray, 
            Y: np.ndarray,
            Phi_val: np.ndarray,
            Y_val: np.ndarray, 
            epochs: int = 100):
        """
        Train the model.
        
        Parameters:
            Phi: Training feature matrix of shape (n_samples, n_features)
            Y: Training labels of shape (n_samples,) with values {-1, 1}
            Phi_val: Validation feature matrix
            Y_val: Validation labels
            epochs: Number of training epochs
        """
        for epoch in range(epochs):
            # Handle KieferWolfowitz separately (requires X, Y for gradient estimation)
            if isinstance(self.optimizer, KieferWolfowitz):
                self.optimizer.step(self.model, X=Phi, Y=Y)
            else:
                grad = self.model.grad(Phi, Y)
                self.optimizer.step(self.model, grad)
            
            # Compute training loss and accuracy
            train_loss = self.model.compute_loss(Phi, Y)
            train_pred = self.model.predict(Phi)
            train_acc = np.mean((train_pred.squeeze() > 0) == (Y > 0))

            # Compute validation loss and accuracy
            val_loss = self.model.compute_loss(Phi_val, Y_val)
            val_pred = self.model.predict(Phi_val)
            val_acc = np.mean((val_pred.squeeze() > 0) == (Y_val > 0))

            # Store history
            self.history["train_loss"].append(float(train_loss))
            self.history["train_accuracy"].append(float(train_acc))
            self.history["val_loss"].append(float(val_loss))
            self.history["val_accuracy"].append(float(val_acc))
