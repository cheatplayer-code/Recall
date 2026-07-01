import { http } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import { mapUser, type UserDTO } from "@/lib/api/mappers";
import type { User } from "@/types";

/** User profile data access — GET/PATCH /users/me. */
export const userService = {
  getMe: async (): Promise<User> => {
    const dto = await http.get<UserDTO>(endpoints.users.me);
    return mapUser(dto);
  },

  updateMe: async (input: { fullName?: string; avatarUrl?: string }): Promise<User> => {
    const dto = await http.patch<UserDTO>(endpoints.users.me, input);
    return mapUser(dto);
  },
};
