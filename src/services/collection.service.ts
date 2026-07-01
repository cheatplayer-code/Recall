import { http, HttpError } from "@/lib/api/http";
import { endpoints } from "@/lib/api/endpoints";
import { mapCollection, type CollectionDTO } from "@/lib/api/mappers";
import type { Collection, ID } from "@/types";

/** Collection data access — GET/POST/PATCH/DELETE /collections. */
export const collectionService = {
  list: async (workspaceId?: ID): Promise<Collection[]> => {
    const path = workspaceId
      ? `${endpoints.collections.list}?workspaceId=${workspaceId}`
      : endpoints.collections.list;
    const dtos = await http.get<CollectionDTO[]>(path);
    return dtos.map(mapCollection);
  },

  getById: async (id: ID): Promise<Collection | null> => {
    try {
      const dto = await http.get<CollectionDTO>(endpoints.collections.detail(id));
      return mapCollection(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  },

  create: async (input: {
    name: string;
    description?: string;
    workspaceId: ID;
  }): Promise<Collection> => {
    const dto = await http.post<CollectionDTO>(endpoints.collections.create, input);
    return mapCollection(dto);
  },

  update: async (
    id: ID,
    input: { name?: string; description?: string },
  ): Promise<Collection> => {
    const dto = await http.patch<CollectionDTO>(endpoints.collections.detail(id), input);
    return mapCollection(dto);
  },

  remove: async (id: ID): Promise<{ id: ID }> => {
    await http.delete<void>(endpoints.collections.detail(id));
    return { id };
  },
};
