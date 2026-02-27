export const canAccessAdmin = (role?: string) => role === "admin";
export const canAccessStudent = (role?: string) => role === "admin" || role === "student";
