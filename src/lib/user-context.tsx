"use client";

import { createContext, useContext } from "react";

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);
