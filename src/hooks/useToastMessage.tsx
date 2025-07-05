import { useEffect } from 'react';
import { UnknownAction  } from 'redux';
import { useAppDispatch } from '../store/redux/hooks';
import { clearMessages } from '../store/slices/roleSlice';
import toast from 'react-hot-toast';

export const useToastMessages = (
  successMessage: string | null, 
  errorMessage: string | null,
  clearAction?: () => UnknownAction ) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      if (clearAction) dispatch(clearAction());
      //dispatch(clearMessages());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      if (clearAction) dispatch(clearAction());
      //dispatch(clearMessages());
    }
  }, [successMessage, errorMessage, clearAction, dispatch]);
};

export const useToastSuccessMessage = (successMessage: string | null) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages());
    }
  }, [successMessage, dispatch]);
};

export const useToastErrorMessage = (errorMessage: string | null) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessages());
    }
  }, [errorMessage, dispatch]);
};


// Hook manual para mostrar toasts directamente
export const useToast = () => {
  const dispatch = useAppDispatch();

  return {
    showSuccess: (msg: string) => toast.success(msg),
    showError: (msg: string) => toast.error(msg),
    clear: () => dispatch(clearMessages())
  };
};