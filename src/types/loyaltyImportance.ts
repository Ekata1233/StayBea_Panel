// types/loyaltyImportance.ts
export interface ILoyaltyImportance {
  title: string;
  description?: string;
  options: {
    _id?: string;
    label?: string;
    description?: string;
  }[];
}
