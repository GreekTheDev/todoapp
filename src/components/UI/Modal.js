import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';
import Button from './Button';
import { FiX } from 'react-icons/fi';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions,
  size = 'medium', // small, medium, large
  hideHeader = false
}) => {
  const modalRef = useRef(null);
  
  // Zamknij modal po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Sprawdź, czy kliknięcie było poza modalem
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Sprawdź, czy kliknięcie nie było w elemencie z klasą ant-picker-dropdown
        // (panel kalendarza DatePicker)
        const pickerDropdown = document.querySelector('.ant-picker-dropdown');
        if (pickerDropdown && pickerDropdown.contains(event.target)) {
          return; // Nie zamykaj modala, jeśli kliknięcie było w panelu kalendarza
        }
        
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Blokuj scrollowanie body gdy modal jest otwarty
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Przywróć scrollowanie po zamknięciu modala
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Obsługa klawisza Escape
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Użyj portalu React do renderowania modalu bezpośrednio w body
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div 
        className={`modal-container modal-${size}`} 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={!hideHeader ? "modal-title" : undefined}
      >
        {!hideHeader && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">{title}</h2>
            <Button 
              variant="icon" 
              size="small" 
              onClick={onClose}
              aria-label="Zamknij"
              className="modal-close-button"
            >
              <FiX />
            </Button>
          </div>
        )}
        
        <div className={`modal-content ${hideHeader ? 'modal-content-no-header' : ''}`}>
          {children}
        </div>
        
        {actions && (
          <div className="modal-actions">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;