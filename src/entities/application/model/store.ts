import { create } from 'zustand';

import { applicationStorage } from '../lib/storage';
import type { Application } from './types';

interface ApplicationStore {
  applications: Application[];
  setApplications: (applications: Application[]) => void;
  addApplication: (application: Application) => void;
  removeApplication: (id: string) => void;
  dropApplication: (id: string) => void;
  persistApplication: (application: Application) => void;
  resetApplicationToPending: (id: string) => void;
}

export const selectCompletedCount = (s: ApplicationStore): number =>
  s.applications.filter((a) => a.application !== null).length;

export const selectHasPending = (s: ApplicationStore): boolean =>
  s.applications.some((a) => a.application === null);

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  // Устанавливает список писем в стор
  setApplications: (applications) => {
    set({ applications });
  },
  // Добавляет письмо в стор
  addApplication: (application) => {
    set((state) => {
      if (state.applications.some((a) => a.id === application.id)) return state;
      return { applications: [...state.applications, application] };
    });
  },
  // Удаляет письмо из стора и из localStorage
  removeApplication: (id) => {
    set((state) => {
      applicationStorage.remove(id, state.applications);
      return { applications: state.applications.filter((a) => a.id !== id) };
    });
  },
  // Удаляет письмо из стора, но не из localStorage
  dropApplication: (id) => {
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== id),
    }));
  },
  // Сохраняет письмо в сторе и в localStorage
  persistApplication: (application) => {
    set((state) => {
      const next = state.applications.map((a) => (a.id === application.id ? application : a));
      applicationStorage.save(application, state.applications);
      return { applications: next };
    });
  },
  // Устанавливает письмо в статус pending в сторе
  resetApplicationToPending: (id) => {
    set((state) => ({
      applications: state.applications.map((a) => (a.id === id ? { ...a, application: null } : a)),
    }));
  },
}));

// Статус ПЕНДИНГ - означает что application поле null
// Установка уже сгенерированного письма в ПЕНДИНГ убирает это письмо из списка завершенных писем
// Завершенные письма для отображения в Баннере и Хедере берется из стора
// Если перегенерируемое письмо успешно - перезапись в стор и локал сторедж по ИД
// Если перегенерируемое письмо с ошибкой - удаление письмо отовсюду
