import { writable } from 'svelte/store';
import { endpoints, fetcher } from '$lib/api';

export interface INodeItem {
  id: string;
  name: string;
  desc: string;
  emittable: boolean;
  emit_count: number;
  online_status: boolean;
}

function createNodesStore() {
  const { subscribe, set, update } = writable<{
    nodes: INodeItem[];
    loading: boolean;
    error: string | null;
  }>({ nodes: [], loading: false, error: null });

  return {
    subscribe,
    fetch: async () => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetcher(endpoints.dashboard.nodeList) as { data: { nodeList: INodeItem[] } };
        set({ nodes: res.data.nodeList ?? [], loading: false, error: null });
      } catch (e) {
        update(s => ({ ...s, loading: false, error: String(e) }));
      }
    }
  };
}

export const nodesStore = createNodesStore();
