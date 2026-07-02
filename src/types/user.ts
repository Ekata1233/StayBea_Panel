export interface IUser {
  id: string;

  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  google_id?: string | null;
  profile_picture?: string | null;

  is_phone_verified: boolean;

  onboarding_step?: string | null;
  next_step?: string | null;
  onboarding_completed: boolean;

  birth_date?: string | null;
  height?: number | null;
  gender?: string | null;
  gender_option?: string | null;
  looking_for?: string | null;
  looking_for_option?: string | null;

  badge_count?: number;
  profile_completion?: number;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}