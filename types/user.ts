export type UserRole = "student" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  totalPoints: number;
  teamId?: string;
  createdAt?: string;
}
