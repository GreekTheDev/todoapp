import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import './DeleteTaskModal.css';

const DeleteTaskModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  const { t } = useContext(LanguageContext);
  
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
            {t('delete')}
          </Button>
          <Button 
            variant="text" 
            onClick={onClose}
          >
            {t('cancel')}
          </Button>
        </>
      }
    >
      <div className="delete-task-content">
        <p className="delete-task-message">
          {t('confirmDelete')} <span className="delete-task-title">{taskTitle}</span>?
        </p>
      </div>
    </Modal>
  );
};

export default DeleteTaskModal;