// src/store/chatStore.js
import { create } from 'zustand';

const WELCOME = {
  id:      'welcome',
  role:    'assistant',
  content: "Hello! I'm **SoumyaOps AI**. Ask me anything about your team's knowledge base, codebase, logs, or past decisions. Every answer includes source references.",
  sources: [],
  ts:      Date.now(),
};

export const useChatStore = create((set, get) => ({
  messages:  [WELCOME],
  streaming: false,
  error:     null,

  addMessage: (msg) =>
    set(state => ({
      messages: [...state.messages, { id: Date.now().toString(), ts: Date.now(), ...msg }],
    })),

  appendToLast: (text) =>
    set(state => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + text };
      }
      return { messages: msgs };
    }),

  setSourcesOnLast: (sources) =>
    set(state => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, sources };
      }
      return { messages: msgs };
    }),

  setStreaming: (v)  => set({ streaming: v }),
  setError:    (err) => set({ error: err }),

  clearMessages: () => set({ messages: [WELCOME], streaming: false, error: null }),
}));