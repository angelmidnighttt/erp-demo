/**
 * Plain business entity for this example resource service. It holds no
 * credentials — authentication lives entirely in the auth-service.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}
