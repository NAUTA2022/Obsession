import { useReducer, useCallback } from 'react';
import { formReducer, FORM_ACTIONS } from './reducer/formReducer';
import type { FormState, FormAction } from '../types/auth';

export const useForm = <T extends Record<string, any>>(initialValues: T = {} as T) => {
  const [state, dispatch] = useReducer(formReducer<T>, {
    values: initialValues,
    errors: {},
    isLoading: false,
    isSuccess: false
  } as FormState<T>);

  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    dispatch({
      type: FORM_ACTIONS.SET_FIELD,
      payload: { field: fieldName, value }
    } as FormAction);
  }, []);

  const setFieldError = useCallback((fieldName: keyof T, error: string) => {
    dispatch({
      type: FORM_ACTIONS.SET_ERROR,
      payload: { field: fieldName, error }
    } as FormAction);
  }, []);

  const resetForm = useCallback((newValues: T = {} as T) => {
    dispatch({
      type: FORM_ACTIONS.RESET_FORM,
      payload: { values: newValues }
    } as FormAction);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({
      type: FORM_ACTIONS.SET_LOADING,
      payload: loading
    } as FormAction);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent | null, onSubmit?: (values: T) => Promise<void>) => {
    if (e) {
      e.preventDefault();
    }

    if (onSubmit) {
      setLoading(true);
      try {
        await onSubmit(state.values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [state.values, setLoading]);

  const getFieldProps = useCallback((fieldName: keyof T) => {
    const value = state.values[fieldName];
    return {
      value: typeof value === 'string' ? value : String(value || ''),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFieldValue(fieldName, e.target.value),
      error: state.errors[fieldName as string] || ''
    };
  }, [state.values, state.errors, setFieldValue]);

  return {
    values: state.values,
    errors: state.errors,
    isLoading: state.isLoading,
    setFieldValue,
    setFieldError,
    resetForm,
    setLoading,
    handleSubmit,
    getFieldProps
  };
}; 