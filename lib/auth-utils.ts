import { jwtDecode } from "jwt-decode";

export function getSessionData(token: string) {
  try {
    // Decodes the JWT to access payload data (role, workspaceId, etc.)
    return jwtDecode(token) as { 
      role: string; 
      workspaceId: string; 
      email: string; 
      userId: string 
    };
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}
