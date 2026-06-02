export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserData {
  name?: string;
  email?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}