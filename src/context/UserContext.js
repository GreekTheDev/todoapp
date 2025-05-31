import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ładowanie danych użytkownika z localStorage przy inicjalizacji
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Zapisywanie danych użytkownika do localStorage przy zmianach
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Rejestracja nowego użytkownika
  const register = (userData) => {
    // W prawdziwej aplikacji tutaj byłoby połączenie z API
    // Na potrzeby demo zapisujemy dane lokalnie
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  // Logowanie użytkownika
  const login = (email, password) => {
    // W prawdziwej aplikacji tutaj byłoby połączenie z API
    // Na potrzeby demo sprawdzamy dane z localStorage
    
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
        return { success: true, user: foundUser };
      }
    }
    
    // Dla celów demonstracyjnych, jeśli nie ma zapisanych użytkowników,
    // pozwalamy zalogować się z dowolnymi danymi
    if (!savedUsers) {
      const demoUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      setUser(demoUser);
      setIsAuthenticated(true);
      return { success: true, user: demoUser };
    }
    
    return { success: false, error: 'Nieprawidłowy email lub hasło' };
  };

  // Wylogowanie użytkownika
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Aktualizacja danych użytkownika
  const updateUserData = (updatedData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedData,
      updatedAt: new Date().toISOString()
    }));
  };

  // Usunięcie konta użytkownika
  const deleteAccount = (password) => {
    // W prawdziwej aplikacji tutaj byłoby połączenie z API
    // Sprawdzamy, czy podane hasło jest poprawne
    if (user && user.password === password) {
      setUser(null);
      setIsAuthenticated(false);
      
      // Usuwamy dane użytkownika z localStorage
      localStorage.removeItem('user');
      
      // Opcjonalnie: usunięcie wszystkich danych użytkownika
      // localStorage.clear();
      
      return { success: true };
    }
    
    return { success: false, error: 'Nieprawidłowe hasło' };
  };

  // Zmiana hasła
  const changePassword = (currentPassword, newPassword) => {
    // W prawdziwej aplikacji tutaj byłoby połączenie z API
    // Na potrzeby demo tylko sprawdzamy, czy currentPassword zgadza się z zapisanym
    if (user && user.password === currentPassword) {
      setUser(prevUser => ({
        ...prevUser,
        password: newPassword,
        updatedAt: new Date().toISOString()
      }));
      return { success: true };
    }
    
    return { success: false, error: 'Nieprawidłowe aktualne hasło' };
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      register,
      login,
      logout,
      updateUserData,
      deleteAccount,
      changePassword
    }}>
      {children}
    </UserContext.Provider>
  );
};