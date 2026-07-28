import React, { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);
  const [messageText, setMessageText] = useState('Please log in to continue your purchase');

  const openAuthDrawer = (options = {}) => {
    if (options && options.message) {
      setMessageText(options.message);
    } else {
      setMessageText('Please log in to continue your purchase');
    }
    if (options && options.onSuccess) {
      setOnSuccessCallback(() => options.onSuccess);
    } else {
      setOnSuccessCallback(null);
    }
    setIsOpen(true);
  };

  const closeAuthDrawer = () => {
    setIsOpen(false);
    setOnSuccessCallback(null);
  };

  const handleSuccess = (userData) => {
    setIsOpen(false);
    if (onSuccessCallback) {
      onSuccessCallback(userData);
      setOnSuccessCallback(null);
    }
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        messageText,
        openAuthDrawer,
        closeAuthDrawer,
        handleSuccess,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
