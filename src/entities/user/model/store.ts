import { create } from 'zustand';

import type { User } from './types';

type UserStore = User & {
  setApplicationGoal: (goal: number) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  applicationGoal: 0,
  setApplicationGoal: (applicationGoal) => {
    set({ applicationGoal });
  },
}));
