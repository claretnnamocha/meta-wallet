import { useState } from 'react';
import { ModalType } from '../components/Modal';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const initialState: ModalState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: ''
};

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>(initialState);

  const showModal = (config: Omit<ModalState, 'isOpen'>) => {
    setModalState({
      ...config,
      isOpen: true
    });
  };

  const hideModal = () => {
    setModalState(initialState);
  };

  const showSuccess = (title: string, message: string) => {
    showModal({
      type: 'success',
      title,
      message
    });
  };

  const showError = (title: string, message: string) => {
    showModal({
      type: 'error',
      title,
      message
    });
  };

  const showWarning = (title: string, message: string) => {
    showModal({
      type: 'warning',
      title,
      message
    });
  };

  const showInfo = (title: string, message: string) => {
    showModal({
      type: 'info',
      title,
      message
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showModal({
      type: 'confirm',
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      showCancel: true
    });
  };

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};