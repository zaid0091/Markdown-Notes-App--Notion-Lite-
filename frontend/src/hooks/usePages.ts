import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import type { Page, PageTreeNode, SearchResult } from '../types';

// Hook: Fetch active hierarchical page tree
export const usePageTree = () => {
  return useQuery<PageTreeNode[]>({
    queryKey: ['pageTree'],
    queryFn: async () => {
      const response = await client.get<PageTreeNode[]>('/api/pages/tree/');
      return response.data;
    },
  });
};

// Hook: Fetch page details by UUID
export const usePageDetails = (id: string | undefined) => {
  return useQuery<Page>({
    queryKey: ['pageDetails', id],
    queryFn: async () => {
      const response = await client.get<Page>(`/api/pages/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook: Fetch all pages (with filtering capability, e.g. for archived notes)
export const usePagesList = (filters?: { is_archived?: boolean; is_favorite?: boolean }) => {
  return useQuery<Page[]>({
    queryKey: ['pagesList', filters],
    queryFn: async () => {
      const response = await client.get<Page[]>('/api/pages/', { params: filters });
      return response.data;
    },
  });
};

// Hook: Create a new page
export const useCreatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Page>) => {
      const response = await client.post<Page>('/api/pages/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageTree'] });
      queryClient.invalidateQueries({ queryKey: ['pagesList'] });
    },
  });
};

// Hook: Update an existing page (PATCH)
export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Page> }) => {
      const response = await client.patch<Page>(`/api/pages/${id}/`, data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pageTree'] });
      queryClient.invalidateQueries({ queryKey: ['pagesList'] });
      queryClient.invalidateQueries({ queryKey: ['pageDetails', variables.id] });
    },
  });
};

// Hook: Permanently delete a page (Destroy)
export const useDeletePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/api/pages/${id}/`);
      return id;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pageTree'] });
      queryClient.invalidateQueries({ queryKey: ['pagesList'] });
      queryClient.invalidateQueries({ queryKey: ['pageDetails', id] });
    },
  });
};

// Hook: Toggle favorite status of a page
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.post<{ status: string; is_favorite: boolean }>(
        `/api/pages/${id}/toggle_favorite/`
      );
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pageTree'] });
      queryClient.invalidateQueries({ queryKey: ['pagesList'] });
      queryClient.invalidateQueries({ queryKey: ['pageDetails', id] });
    },
  });
};

// Hook: Soft-delete/Archive a page (and its descendants)
export const useArchivePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.post<{ status: string }>(`/api/pages/${id}/archive/`);
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pageTree'] });
      queryClient.invalidateQueries({ queryKey: ['pagesList'] });
      queryClient.invalidateQueries({ queryKey: ['pageDetails', id] });
    },
  });
};

// Hook: Restore a soft-deleted/archived page (and its descendants)
export const useRestorePage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.post<{ status: string }>(`/api/pages/${id}/restore/`);
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pageTree'] });
      queryClient.invalidateQueries({ queryKey: ['pagesList'] });
      queryClient.invalidateQueries({ queryKey: ['pageDetails', id] });
    },
  });
};

// Hook: Execute full-text search
export const useSearchPages = (query: string) => {
  return useQuery<SearchResult[]>({
    queryKey: ['pageSearch', query],
    queryFn: async () => {
      const response = await client.get<SearchResult[]>('/api/pages/search/', {
        params: { q: query },
      });
      return response.data;
    },
    enabled: query.trim().length > 0,
  });
};
