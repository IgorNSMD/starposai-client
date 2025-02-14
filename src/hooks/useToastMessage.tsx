import { useEffect } from 'react';
import { useAppDispatch } from '../store/redux/hooks';
import { clearMessages } from '../store/slices/roleSlice';
import toast from 'react-hot-toast';

export const useToastMessages = (successMessage: string | null, errorMessage: string | null) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessages());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessages());
    }
  }, [successMessage, errorMessage, dispatch]);
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
