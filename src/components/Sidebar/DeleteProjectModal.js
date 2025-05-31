import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import './DeleteProjectModal.css';

const DeleteProjectModal = ({ isOpen, onClose, onConfirm, projectName }) => {
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
      <div className="delete-project-content">
        <p className="delete-project-message">
          {t('confirmDelete')} <span className="delete-project-title">{projectName}</span>?
        </p>
        <p className="delete-project-warning">
          {t('projectDeleted')}
        </p>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;