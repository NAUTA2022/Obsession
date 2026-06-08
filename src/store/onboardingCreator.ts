import { create } from 'zustand';

const STORAGE_KEY = 'onboarding_creator_draft';

export interface OnboardingCreatorState {
  displayName: string;
  bio: string;
  location: string;
  contentType: string;
  profilePictureUrl: string;
  hasGoogleConnected: boolean;
  workingHoursSaved: boolean;
  plansAdded: number;
  setField: <K extends keyof OnboardingDraftFields>(
    key: K,
    value: OnboardingDraftFields[K],
  ) => void;
  reset: () => void;
}

export type OnboardingDraftFields = Omit<OnboardingCreatorState, 'setField' | 'reset'>;

const defaults: OnboardingDraftFields = {
  displayName: '',
  bio: '',
  location: '',
  contentType: '',
  profilePictureUrl: '',
  hasGoogleConnected: false,
  workingHoursSaved: false,
  plansAdded: 0,
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
    const { displayName, bio, location, contentType, profilePictureUrl, hasGoogleConnected, workingHoursSaved, plansAdded } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ displayName, bio, location, contentType, profilePictureUrl, hasGoogleConnected, workingHoursSaved, plansAdded }),
    );
  } catch {
    /* ignore */
  }
}

export const useOnboardingCreatorStore = create<OnboardingCreatorState>((set, get) => ({
  ...loadInitial(),
  setField: (key, value) => {
    set({ [key]: value } as Partial<OnboardingCreatorState>);
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
