export enum UserType {
  COMPANY_MEMBER = 'company_member',
  PUBLIC_USER = 'public_user'
}

export interface UserMetadata {
  user_type: UserType;
  first_name?: string;
  last_name?: string;
}

export interface UserDetails {
  id: string;
  email: string;
  metadata: UserMetadata;
  membership?: {
    company_id: string;
    role: string;
  };
}
