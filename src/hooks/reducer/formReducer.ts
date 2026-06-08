import type { FormState, FormAction } from '../../types/auth';

// Action types
export const FORM_ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_ERROR: 'SET_ERROR',
  SET_LOADING: 'SET_LOADING',
  RESET_FORM: 'RESET_FORM'
} as const;

export const formReducer = <T extends Record<string, any>>(
  state: FormState<T>, 
  action: FormAction
): FormState<T> => {
  switch (action.type) {
    case FORM_ACTIONS.SET_FIELD:
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.field]: action.payload.value
        }
      };

    case FORM_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.error
        }
      };

    case FORM_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case FORM_ACTIONS.RESET_FORM:
      return {
        ...state,
        values: action.payload.values || {},
        errors: {},
        isLoading: false
      };

    default:
      return state;
  }
}; 