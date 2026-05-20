import type { Application } from '../model/types';

const STORAGE_KEY = 'applications';

function getAll(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

function persist(applications: Application[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function save(application: Application, current: Application[]): void {
  const index = current.findIndex((a) => a.id === application.id);
  const next =
    index >= 0
      ? current.map((a) => (a.id === application.id ? application : a))
      : [...current, application];
  persist(next);
}

function remove(id: string, current: Application[]): void {
  persist(current.filter((a) => a.id !== id));
}

export const applicationStorage = { getAll, save, remove };

// Так как приложение обрабатывает письма на клиенте без сервера,
// Я бы не ожидал обработки сотен писем.
// Поэтому использую JSON методы на массиве, а не каждом отдельно.
// Можно было бы использовать IndexedDB, но в данном случае это оверинжиниринг.
