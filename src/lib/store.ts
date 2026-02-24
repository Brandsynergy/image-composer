'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from './idb-storage';
import { v4 as uuidv4 } from 'uuid';
import type { AIModel, GeneratedImage, Campaign, AppSettings, GenerationJob, FaceConfig, BodyConfig, StyleConfig, SceneConfig, OutputConfig } from '@/types';

// ─── Default Configs ───────────────────────────────────────────
const defaultFace: FaceConfig = {
  ethnicity: 'European',
  age: '23-27',
  gender: 'Female',
  skinTone: 'Medium',
  faceShape: 'Oval',
  eyeColor: 'Brown',
  eyeShape: 'Almond',
  hairColor: 'Dark Brown',
  hairStyle: 'Wavy',
  hairLength: 'Shoulder-Length',
  features: [],
  expression: 'Neutral/Confident',
};

const defaultBody: BodyConfig = {
  bodyType: 'Athletic',
  height: 'Average (5\'4-5\'6)',
  build: 'Toned',
  skinTexture: 'Glowing',
};

const defaultStyle: StyleConfig = {
  aesthetic: 'Clean Girl',
  fashionStyle: 'Casual Chic',
  colorPalette: ['#000000', '#FFFFFF', '#D4A373', '#2D6A4F'],
  vibeKeywords: ['Aspirational', 'Authentic'],
  influencerNiche: 'Fashion & Style',
};

export const defaultScene: SceneConfig = {
  setting: 'Studio (White Background)',
  pose: 'Standing Confident',
  outfit: 'Casual Streetwear',
  outfitDetails: '',
  lighting: 'Natural Daylight',
  cameraAngle: 'Eye Level',
  cameraDistance: 'Medium Shot (Waist)',
  mood: 'Empowering',
  props: [],
  background: 'Clean/Minimal',
  timeOfDay: 'Afternoon',
  customPrompt: '',
};

export const defaultOutput: OutputConfig = {
  aspectRatio: '4:5',
  quality: 'hd',
  count: 1,
  format: 'png',
};

// ─── Store Interface ───────────────────────────────────────────
interface AppStore {
  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // Models
  models: AIModel[];
  activeModelId: string | null;
  addModel: (model: Omit<AIModel, 'id' | 'createdAt' | 'updatedAt'>) => AIModel;
  updateModel: (id: string, updates: Partial<AIModel>) => void;
  deleteModel: (id: string) => void;
  setActiveModel: (id: string | null) => void;
  getActiveModel: () => AIModel | undefined;

  // Generated Images
  images: GeneratedImage[];
  addImage: (image: Omit<GeneratedImage, 'id' | 'createdAt'>) => void;
  addImages: (images: Omit<GeneratedImage, 'id' | 'createdAt'>[]) => void;
  deleteImage: (id: string) => void;
  toggleFavorite: (id: string) => void;
  tagImage: (id: string, tags: string[]) => void;
  assignToCampaign: (imageId: string, campaignId: string) => void;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;

  // Generation Jobs
  activeJobs: GenerationJob[];
  addJob: (job: GenerationJob) => void;
  updateJob: (id: string, updates: Partial<GenerationJob>) => void;
  removeJob: (id: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Defaults
  defaultFace: FaceConfig;
  defaultBody: BodyConfig;
  defaultStyle: StyleConfig;
}

// ─── Store Implementation ──────────────────────────────────────
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Hydration ─────────────────────────────────────────────
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      // ── Models ────────────────────────────────────────────────
      models: [],
      activeModelId: null,

      addModel: (modelData) => {
        const model: AIModel = {
          ...modelData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ models: [model, ...state.models] }));
        return model;
      },

      updateModel: (id, updates) => {
        set((state) => ({
          models: state.models.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
          ),
        }));
      },

      deleteModel: (id) => {
        set((state) => ({
          models: state.models.filter((m) => m.id !== id),
          activeModelId: state.activeModelId === id ? null : state.activeModelId,
        }));
      },

      setActiveModel: (id) => set({ activeModelId: id }),

      getActiveModel: () => {
        const state = get();
        return state.models.find((m) => m.id === state.activeModelId);
      },

      // ── Images ──────────────────────────────────────────────
      images: [],

      addImage: (imageData) => {
        const image: GeneratedImage = {
          ...imageData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ images: [image, ...state.images] }));
      },

      addImages: (imagesData) => {
        const images: GeneratedImage[] = imagesData.map((img) => ({
          ...img,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        }));
        set((state) => ({ images: [...images, ...state.images] }));
      },

      deleteImage: (id) => {
        set((state) => ({ images: state.images.filter((i) => i.id !== id) }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          images: state.images.map((i) =>
            i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
          ),
        }));
      },

      tagImage: (id, tags) => {
        set((state) => ({
          images: state.images.map((i) => (i.id === id ? { ...i, tags } : i)),
        }));
      },

      assignToCampaign: (imageId, campaignId) => {
        set((state) => ({
          images: state.images.map((i) =>
            i.id === imageId ? { ...i, campaignId } : i
          ),
          campaigns: state.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, imageIds: [...new Set([...c.imageIds, imageId])] }
              : c
          ),
        }));
      },

      // ── Campaigns ───────────────────────────────────────────
      campaigns: [],

      addCampaign: (campaignData) => {
        const campaign: Campaign = {
          ...campaignData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ campaigns: [campaign, ...state.campaigns] }));
        return campaign;
      },

      updateCampaign: (id, updates) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        }));
      },

      // ── Jobs ────────────────────────────────────────────────
      activeJobs: [],
      addJob: (job) => set((state) => ({ activeJobs: [...state.activeJobs, job] })),
      updateJob: (id, updates) => {
        set((state) => ({
          activeJobs: state.activeJobs.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        }));
      },
      removeJob: (id) => {
        set((state) => ({
          activeJobs: state.activeJobs.filter((j) => j.id !== id),
        }));
      },

      // ── Settings ────────────────────────────────────────────
      settings: {
        replicateApiKey: '',
        defaultModel: 'black-forest-labs/flux-2-pro',
        defaultQuality: 'hd',
        theme: 'dark',
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }));
      },

      // ── Defaults ────────────────────────────────────────────
      defaultFace,
      defaultBody,
      defaultStyle,
    }),
    {
      name: 'image-composer-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        models: state.models,
        activeModelId: state.activeModelId,
        images: state.images,
        campaigns: state.campaigns,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Purge images/thumbnails with expired Replicate URLs (only data: URLs persist)
          const isValid = (url?: string) => !url || url.startsWith('data:');

          const cleanImages = state.images.filter((img) => isValid(img.url));
          const cleanModels = state.models.map((m) => ({
            ...m,
            thumbnail: isValid(m.thumbnail) ? m.thumbnail : undefined,
            referenceImages: m.referenceImages.filter((r) => isValid(r)),
          }));

          if (cleanImages.length !== state.images.length || cleanModels.some((m, i) => m !== state.models[i])) {
            useAppStore.setState({ images: cleanImages, models: cleanModels });
          }

          state.setHasHydrated(true);
        }
      },
    }
  )
);
