export interface IUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  google_id?: string | null;
  is_phone_verified: boolean;
  onboarding_step: number;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}