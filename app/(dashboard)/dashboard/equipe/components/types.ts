export interface TeamMember {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface TeamData {
  owner: {
    id: number;
    email: string;
    full_name: string;
  };
  team_members: TeamMember[];
  max_members: number;
  current_count: number;
}

export interface AddMemberFormData {
  email: string;
  full_name: string;
}
