import React from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import './DeleteTaskModal.css';

const DeleteTaskModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      hideHeader={true}
      size="small"
      actions={
        <>
          <Button 
            variant="error" 
            onClick={handleConfirm}
          >
            Usuń
          </Button>
          <Button 
            variant="text" 
            onClick={onClose}
          >
            Anuluj
          </Button>
        </>
      }
    >
      <div className="delete-task-content">
        <p className="delete-task-message">
          Usunąć zadanie <span className="delete-task-title">{taskTitle}</span>?
        </p>
      </div>
    </Modal>
  );
};

export default DeleteTaskModal;