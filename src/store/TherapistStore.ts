// src/stores/therapistStore.ts
import { defineStore } from 'pinia';
import Therapist from '@/class/Therapist';
import { JSONTherapistDTO } from '@/class/JSONStructures';
import { convertToTherapist, convertToTherapistDTO } from './convert';
import apiClient from './apiClient';
import { toast } from 'vue3-toastify';
import User from '@/class/User';

export const useTherapistStore = defineStore('therapist', {
  state: () => ({
    therapists: [] as Therapist[],
    therapist: {} as Therapist | null,
    therapistUser: {} as { [key: number]: User },
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadTherapists(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const responseData: JSONTherapistDTO[] = (await apiClient.get('therapists')).data;
        this.therapists = responseData.map((dto) => convertToTherapist(dto));

        for (const therapist of this.therapists) {
          const userResponse = await apiClient.get(`/auth/user/therapist/${therapist.id}`);
          this.therapistUser[therapist.id] = userResponse.data;
        }
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

        const userResponse = await apiClient.get(`/auth/user/therapist/${id}`);
        this.therapistUser[id] = userResponse.data;
      } catch (err) {
        console.error(err);
      }
    },

    async addTherapist(therapist: Therapist): Promise<void> {
      try {
        therapist.fullName = therapist.firstName + ' ' + therapist.lastName;
        const therapistDTO = convertToTherapistDTO(therapist);
        await apiClient.post('therapists', therapistDTO);
        toast.success('Therapeut erfolgreich erstellt');
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },

    async updateTherapist(id: number, therapist: Therapist): Promise<void> {
      try {
        therapist.fullName = therapist.firstName + ' ' + therapist.lastName;
        const therapistDTO = convertToTherapistDTO(therapist);
        await apiClient.put(`therapists/${id}`, therapistDTO);
        toast.success('Therapeut erfolgreich gespeichert');
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },

    async deleteTherapist(id: number): Promise<void> {
      try {
        await apiClient.delete(`therapists/${id}`);
        toast.success('Therapeut erfolgreich gelöscht');
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

    getTherapistUserById: (state) => (therapistId: number) => {
      return state.therapistUser[therapistId];
    },
  },
});
