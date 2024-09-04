// src/stores/therapistStore.ts
import { defineStore } from 'pinia';
import Therapist from '@/class/Therapist';
import { JSONTherapistDTO } from '@/class/JSONStructures';
import { convertToTherapist, convertToTherapistDTO } from './convert';
import { useAuthStore } from './authStore';
import apiClient from './apiClient';

export const useTherapistStore = defineStore('therapist', {
  state: () => ({
    therapists: [] as Therapist[],
    therapist: {} as Therapist | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadTherapists(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const authStore = useAuthStore();
        const responseData: JSONTherapistDTO[] = (await apiClient.get('therapists')).data;
        this.therapists = responseData.map((dto) => convertToTherapist(dto));
      } catch (err) {
        this.error = 'Failed to load therapists';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async loadTherapist(id: number): Promise<void> {
      try {
        const responseData: JSONTherapistDTO = (await apiClient.get(`therapist/${id}`)).data;
        this.therapist = convertToTherapist(responseData);
      } catch (err) {
        console.error(err);
      }
    },

    async addTherapist(therapist: Therapist): Promise<void> {
      try {
        const therapistDTO = convertToTherapistDTO(therapist);
        await apiClient.post('therapists', therapistDTO);
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },

    async updateTherapist(id: number, therapist: Therapist): Promise<void> {
      try {
        const therapistDTO = convertToTherapistDTO(therapist);
        await apiClient.put(`therapists/${id}`, therapistDTO);
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },

    async deleteTherapist(id: number): Promise<void> {
      try {
        await apiClient.delete(`therapists/${id}`);
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },
  },

  getters: {
    getAllTherapists: (state) => state.therapists,

    getTherapistById: (state) => (id: number) => {
      return state.therapists.find(therapist => therapist.id === id);
    },

    getTherapists: (state) => () => {
      return state.therapists || [];
    },
  },
});
