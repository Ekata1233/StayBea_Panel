// types/lifestyleHabits.ts
export interface ILifestyleHabits {
  title: string;
  description: string;
  habits: {
    _id?: string;
    label: string; // question
    options: {
      _id?: string;
      label: string; // answer option
      description?: string;
    }[];
  }[];
}
