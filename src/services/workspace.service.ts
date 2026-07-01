import { http, HttpError } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import { mapWorkspace, type WorkspaceDTO } from "@/lib/api/mappers";
import type { ID, Workspace } from "@/types";

/** Workspace data access — GET/POST/PATCH/DELETE /workspaces. */
export const workspaceService = {
  list: async (): Promise<Workspace[]> => {
    const dtos = await http.get<WorkspaceDTO[]>(endpoints.workspaces.list);
    return dtos.map(mapWorkspace);
  },

  getById: async (id: ID): Promise<Workspace | null> => {
    try {
      const dto = await http.get<WorkspaceDTO>(endpoints.workspaces.detail(id));
      return mapWorkspace(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  },

  create: async (input: { name: string; description?: string }): Promise<Workspace> => {
    const dto = await http.post<WorkspaceDTO>(endpoints.workspaces.create, input);
    return mapWorkspace(dto);
  },

  update: async (
    id: ID,
    input: { name?: string; description?: string },
  ): Promise<Workspace> => {
    const dto = await http.patch<WorkspaceDTO>(endpoints.workspaces.detail(id), input);
    return mapWorkspace(dto);
  },

  remove: async (id: ID): Promise<{ id: ID }> => {
    await http.delete<void>(endpoints.workspaces.detail(id));
    return { id };
  },
};
