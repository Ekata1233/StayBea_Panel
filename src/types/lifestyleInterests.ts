// types/lifestyleInterests.ts
export interface ILifestyleInterests {
  title: string;
  description?: string;
  categories: {
    _id?: string;
    label: string;
    description?: string;
    options: {
      _id?: string;
      label: string;
      description?: string;
      icon?: string; // to hold emoji if present
    }[];
  }[];
}
