// types/idealPartner.ts
export interface IIdealPartner {
  title: string;
  description?: string;
  options: {
    _id?: string;
    label?: string;
    description?: string;
  }[];
}
