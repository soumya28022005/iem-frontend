// src/store/workspaceStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      workspaceId:   null,
      workspaceName: null,
      workspaces:    [],

      setWorkspace: (id, name) => set({ workspaceId: id, workspaceName: name }),
      setWorkspaces: (list)    => set({ workspaces: list }),

      addWorkspace: (ws) => set(state => ({
        workspaces: [ws, ...state.workspaces.filter(w => w.id !== ws.id)],
      })),

      clearWorkspace: () => set({ workspaceId: null, workspaceName: null }),

      currentWorkspace: () => {
        const { workspaceId, workspaces } = get();
        return workspaces.find(w => w.id === workspaceId) || null;
      },
    }),
    {
      name: 'soumyaops-workspace',
      partialize: (s) => ({ workspaceId: s.workspaceId, workspaceName: s.workspaceName }),
    },
  ),
);