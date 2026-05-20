export interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  skills: string;
  additionalDetails: string;
  application: string | null;
}

// Статус ПЕНДИНГ - означает что application поле null, письмо не сгенерировано
