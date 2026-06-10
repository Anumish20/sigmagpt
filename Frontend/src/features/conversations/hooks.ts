import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Conversation } from "@/types";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: api.listConversations,
    staleTime: 10_000,
  });
}

export function useMessages(id: string | null) {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => api.getMessages(id as string),
    enabled: !!id,
  });
}

export function useModels() {
  return useQuery({ queryKey: ["models"], queryFn: api.getModels, staleTime: 60_000 });
}

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: api.getHealth, refetchInterval: 30_000 });
}

export function useUpdateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Conversation> }) =>
      api.updateConversation(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ["conversations"] });
      const prev = qc.getQueryData<Conversation[]>(["conversations"]);
      qc.setQueryData<Conversation[]>(["conversations"], (old) =>
        (old ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["conversations"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteConversation(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["conversations"] });
      const prev = qc.getQueryData<Conversation[]>(["conversations"]);
      qc.setQueryData<Conversation[]>(["conversations"], (old) =>
        (old ?? []).filter((c) => c.id !== id)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["conversations"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}
