import { create } from 'zustand';

const STORAGE_KEY = 'onboarding_seller_draft';

export interface OnboardingSellerState {
  nationality: string;
  state: string;
  languages: string[];
  collaborationSlots: number;
  salesCommission: number;
  description: string;
  productCategories: string[];
  setField: <K extends keyof OnboardingDraftFields>(
    key: K,
    value: OnboardingDraftFields[K],
  ) => void;
  reset: () => void;
}

export type OnboardingDraftFields = Omit<OnboardingSellerState, 'setField' | 'reset'>;

const defaults: OnboardingDraftFields = {
  nationality: '',
  state: '',
  languages: [],
  collaborationSlots: 6,
  salesCommission: 20,
  description: '',
  productCategories: [],
};

function loadInitial(): OnboardingDraftFields {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function persist(state: OnboardingDraftFields) {
  try {
    const {
      nationality,
      state: stateValue,
      languages,
      collaborationSlots,
      salesCommission,
      description,
      productCategories,
    } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nationality,
        state: stateValue,
        languages,
        collaborationSlots,
        salesCommission,
        description,
        productCategories,
      }),
    );
  } catch {
    /* ignore */
  }
}

export const useOnboardingSellerStore = create<OnboardingSellerState>((set, get) => ({
  ...loadInitial(),
  setField: (key, value) => {
    set({ [key]: value } as Partial<OnboardingSellerState>);
    persist(get());
  },
  reset: () => {
    set({ ...defaults });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
}));
