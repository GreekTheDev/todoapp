import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { LanguageContext } from '../../context/LanguageContext';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { FiUser, FiMail, FiLock, FiLogOut, FiTrash2 } from 'react-icons/fi';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, login, register, logout, updateUserData, deleteAccount, changePassword } = useContext(UserContext);
  const { t } = useContext(LanguageContext);
  
  // Stany dla różnych widoków
  const [view, setView] = useState(isAuthenticated ? 'profile' : 'login');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Stany dla formularzy
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [profileForm, setProfileForm] = useState(user ? { name: user.name, email: user.email } : { name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [deleteAccountForm, setDeleteAccountForm] = useState({ password: '' });
  
  // Stany dla błędów
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  
  // Resetowanie stanów przy zamknięciu modalu
  const handleClose = () => {
    setView(isAuthenticated ? 'profile' : 'login');
    setConfirmDelete(false);
    setLoginError('');
    setRegisterError('');
    setProfileError('');
    setPasswordError('');
    setDeleteAccountError('');
    setDeleteAccountForm({ password: '' });
    onClose();
  };
  
  // Obsługa logowania
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginForm.email || !loginForm.password) {
      setLoginError(t('fillAllFields'));
      return;
    }
    
    const result = login(loginForm.email, loginForm.password);
    if (result.success) {
      setView('profile');
      setLoginForm({ email: '', password: '' });
    } else {
      setLoginError(result.error);
    }
  };
  
  // Obsługa rejestracji
  const handleRegister = (e) => {
    e.preventDefault();
    setRegisterError('');
    
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setRegisterError(t('fillAllFields'));
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError(t('passwordsNotMatch'));
      return;
    }
    
    register(registerForm);
    setView('profile');
    setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
  };
  
  // Obsługa aktualizacji profilu
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileError('');
    
    if (!profileForm.name || !profileForm.email) {
      setProfileError(t('fillAllFields'));
      return;
    }
    
    updateUserData(profileForm);
    setProfileError(t('profileUpdated'));
  };
  
  // Obsługa zmiany hasła
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      setPasswordError(t('fillAllFields'));
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError(t('passwordsNotMatch'));
      return;
    }
    
    const result = changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      setPasswordError(t('passwordChanged'));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } else {
      setPasswordError(result.error);
    }
  };
  
  // Obsługa wylogowania
  const handleLogout = () => {
    logout();
    setView('login');
  };
  
  // Obsługa usunięcia konta
  const handleDeleteAccount = (e) => {
    if (e) e.preventDefault();
    
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setDeleteAccountError('');
    
    if (!deleteAccountForm.password) {
      setDeleteAccountError(t('enterPasswordToConfirm'));
      return;
    }
    
    const result = deleteAccount(deleteAccountForm.password);
    
    if (result.success) {
      setView('login');
      setConfirmDelete(false);
      setDeleteAccountForm({ password: '' });
    } else {
      setDeleteAccountError(result.error);
    }
  };
  
  // Renderowanie formularza logowania
  const renderLoginForm = () => (
    <div className="profile-form-container">
      <h2 className="profile-form-title">{t('login')}</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="login-email">
            <FiMail className="form-icon" />
            {t('email')}
          </label>
          <input
            id="login-email"
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            placeholder="Twój email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">
            <FiLock className="form-icon" />
            {t('password')}
          </label>
          <input
            id="login-password"
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            placeholder="Twoje hasło"
          />
        </div>
        {loginError && <p className="form-error">{loginError}</p>}
        <div className="form-actions">
          <Button type="submit" variant="primary">{t('loginButton')}</Button>
          <Button type="button" variant="text" onClick={() => setView('register')}>
            {t('noAccount')}
          </Button>
        </div>
      </form>
    </div>
  );
  
  // Renderowanie formularza rejestracji
  const renderRegisterForm = () => (
    <div className="profile-form-container">
      <h2 className="profile-form-title">{t('register')}</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="register-name">
            <FiUser className="form-icon" />
            {t('name')}
          </label>
          <input
            id="register-name"
            type="text"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
            placeholder="Twoje imię"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-email">
            <FiMail className="form-icon" />
            {t('email')}
          </label>
          <input
            id="register-email"
            type="email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            placeholder="Twój email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-password">
            <FiLock className="form-icon" />
            {t('password')}
          </label>
          <input
            id="register-password"
            type="password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            placeholder="Twoje hasło"
          />
        </div>
        <div className="form-group">
          <label htmlFor="register-confirm-password">
            <FiLock className="form-icon" />
            {t('confirmPassword')}
          </label>
          <input
            id="register-confirm-password"
            type="password"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            placeholder="Potwierdź hasło"
          />
        </div>
        {registerError && <p className="form-error">{registerError}</p>}
        <div className="form-actions">
          <Button type="submit" variant="primary">{t('registerButton')}</Button>
          <Button type="button" variant="text" onClick={() => setView('login')}>
            {t('hasAccount')}
          </Button>
        </div>
      </form>
    </div>
  );
  
  // Renderowanie widoku profilu
  const renderProfileView = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FiUser size={40} />
        </div>
        <div className="profile-info">
          <h2>{user?.name || 'Użytkownik'}</h2>
          <p>{user?.email || 'email@example.com'}</p>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${view === 'profile' ? 'active' : ''}`}
          onClick={() => setView('profile')}
        >
          {t('profile')}
        </button>
        <button 
          className={`profile-tab ${view === 'password' ? 'active' : ''}`}
          onClick={() => setView('password')}
        >
          {t('changePassword')}
        </button>
      </div>
      
      {view === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-group">
            <label htmlFor="profile-name">
              <FiUser className="form-icon" />
              {t('name')}
            </label>
            <input
              id="profile-name"
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Twoje imię"
            />
          </div>
          <div className="form-group">
            <label htmlFor="profile-email">
              <FiMail className="form-icon" />
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="Twój email"
            />
          </div>
          {profileError && <p className={profileError.includes('pomyślnie') ? 'form-success' : 'form-error'}>{profileError}</p>}
          <Button type="submit" variant="primary">{t('saveChanges')}</Button>
        </form>
      )}
      
      {view === 'password' && (
        <form onSubmit={handleChangePassword} className="profile-form">
          <div className="form-group">
            <label htmlFor="current-password">
              <FiLock className="form-icon" />
              {t('currentPassword')}
            </label>
            <input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder={t('currentPassword')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">
              <FiLock className="form-icon" />
              {t('newPassword')}
            </label>
            <input
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder={t('newPassword')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">
              <FiLock className="form-icon" />
              {t('confirmNewPassword')}
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={passwordForm.confirmNewPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
              placeholder={t('confirmNewPassword')}
            />
          </div>
          {passwordError && <p className={passwordError.includes('pomyślnie') ? 'form-success' : 'form-error'}>{passwordError}</p>}
          <Button type="submit" variant="primary">{t('changePassword')}</Button>
        </form>
      )}
      
      <div className="profile-actions">
        <Button 
          type="button" 
          variant="text" 
          className="logout-button"
          onClick={handleLogout}
        >
          <FiLogOut className="button-icon" />
          {t('logout')}
        </Button>
        
        {!confirmDelete ? (
          <Button 
            type="button" 
            variant="danger" 
            className="delete-account-button"
            onClick={handleDeleteAccount}
          >
            <FiTrash2 className="button-icon" />
            {t('deleteAccount')}
          </Button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="delete-account-form">
            <h3 className="delete-account-title">{t('confirmDeleteAccount')}</h3>
            <p className="delete-account-info">
              {t('deleteAccountInfo')}
            </p>
            <div className="form-group">
              <label htmlFor="delete-account-password">
                <FiLock className="form-icon" />
                {t('password')}
              </label>
              <input
                id="delete-account-password"
                type="password"
                value={deleteAccountForm.password}
                onChange={(e) => setDeleteAccountForm({ password: e.target.value })}
                placeholder={t('enterPassword')}
                autoFocus
              />
            </div>
            {deleteAccountError && <p className="form-error">{deleteAccountError}</p>}
            <div className="delete-account-actions">
              <Button type="submit" variant="danger">
                <FiTrash2 className="button-icon" />
                {t('deleteAccount')}
              </Button>
              <Button 
                type="button" 
                variant="text" 
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteAccountForm({ password: '' });
                  setDeleteAccountError('');
                }}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="profile-modal">
      {isAuthenticated ? renderProfileView() : (view === 'login' ? renderLoginForm() : renderRegisterForm())}
    </Modal>
  );
};

export default ProfileModal;