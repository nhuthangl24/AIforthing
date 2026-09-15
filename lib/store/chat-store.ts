import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultModelId } from '../ai/models';

export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  name: string;
  contentType: string;
  data: string; // base64
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  timestamp: number;
  thinking?: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;
  sidebarOpen: boolean;
  globalModelId: string; // Used as default for new conversations
  credits: number; // User credits
  
  // Actions
  deductCredits: (amount: number) => void;
  createConversation: (modelId?: string) => string;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  setSidebarOpen: (open: boolean) => void;
  setGlobalModelId: (id: string) => void;
  updateConversationModel: (id: string, modelId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: {},
      currentConversationId: null,
      sidebarOpen: true,
      globalModelId: getDefaultModelId(),
      credits: 54953.28,

      deductCredits: (amount) => set((state) => ({
        credits: Math.max(0, state.credits - amount)
      })),

      createConversation: (modelId) => {
        const id = generateId();
        const now = Date.now();
        const newConversation: Conversation = {
          id,
          title: 'New Conversation',
          modelId: modelId || get().globalModelId,
          messages: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          conversations: { ...state.conversations, [id]: newConversation },
          currentConversationId: id,
        }));

        return id;
      },

      setCurrentConversation: (id) => set({ currentConversationId: id }),

      deleteConversation: (id) => set((state) => {
        const { [id]: _, ...rest } = state.conversations;
        return {
          conversations: rest,
          currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
        };
      }),

      addMessage: (conversationId, message) => set((state) => {
        const conversation = state.conversations[conversationId];
        if (!conversation) return state;

        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };
        
        // Generate title from first user message if title is default
        let newTitle = conversation.title;
        if (conversation.messages.length === 0 && message.role === 'user') {
          newTitle = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
        }

        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              title: newTitle,
              messages: [...conversation.messages, newMessage],
              updatedAt: Date.now(),
            },
          },
        };
      }),

      updateMessage: (conversationId, messageId, updates) => set((state) => {
        const conversation = state.conversations[conversationId];
        if (!conversation) return state;

        const updatedMessages = conversation.messages.map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        );

        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              messages: updatedMessages,
              updatedAt: Date.now(),
            },
          },
        };
      }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setGlobalModelId: (id) => set({ globalModelId: id }),
      
      updateConversationModel: (id, modelId) => set((state) => {
        const conversation = state.conversations[id];
        if (!conversation) return state;
        
        return {
          conversations: {
            ...state.conversations,
            [id]: {
              ...conversation,
              modelId,
              updatedAt: Date.now(),
            },
          }
        };
      }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
