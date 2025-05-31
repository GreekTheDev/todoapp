import React from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import './DeleteProjectModal.css';

const DeleteProjectModal = ({ isOpen, onClose, onConfirm, projectName }) => {
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
      <div className="delete-project-content">
        <p className="delete-project-message">
          Usunąć projekt <span className="delete-project-title">{projectName}</span>?
        </p>
        <p className="delete-project-warning">
          Zadania w projekcie zostaną usunięte.
        </p>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;