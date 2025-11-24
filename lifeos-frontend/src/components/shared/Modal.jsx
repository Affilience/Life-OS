import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  className = '' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Backdrop */}
        <div 
          className="modal-backdrop"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button
              className="modal-close"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;