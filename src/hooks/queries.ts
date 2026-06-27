import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clientsApi,
  teamApi,
  postsApi,
  campaignsApi,
  videosApi,
  agendaApi,
} from '@/services/api';
import type { PostStatus, VideoStage } from '@/types';

export const useClients = () =>
  useQuery({ queryKey: ['clients'], queryFn: clientsApi.list });

export const useClient = (id: string) =>
  useQuery({ queryKey: ['client', id], queryFn: () => clientsApi.get(id) });

export const useTeam = () =>
  useQuery({ queryKey: ['team'], queryFn: teamApi.list });

export const usePosts = () =>
  useQuery({ queryKey: ['posts'], queryFn: postsApi.list });

export const useCampaigns = () =>
  useQuery({ queryKey: ['campaigns'], queryFn: campaignsApi.list });

export const useVideos = () =>
  useQuery({ queryKey: ['videos'], queryFn: videosApi.list });

export const useAgenda = () =>
  useQuery({ queryKey: ['agenda'], queryFn: agendaApi.list });

export function useUpdatePostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PostStatus }) =>
      postsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useReschedulePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      postsApi.reschedule(id, scheduledAt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useUpdateVideoStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: VideoStage }) =>
      videosApi.updateStage(id, stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
}
