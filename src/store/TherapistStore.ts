import { defineStore } from 'pinia';
import axios from 'axios';
import Therapist from '@/class/Therapist';
import { JSONTherapistDTO } from '@/class/JSONStructures';
import { convertToTherapist, convertToTherapistDTO } from './convert';

export const useTherapistStore = defineStore('therapist', {
  state: () => ({
    therapists: [] as Therapist[],
    therapist: {} as Therapist | null,
  }),

  actions: {
    async loadTherapists(): Promise<void> {
      try {
        const responseData: JSONTherapistDTO[] = (await axios.get('http://localhost:8080/api/therapists')).data;
        this.therapists = responseData.map((dto) => convertToTherapist(dto));
      } catch (err) {
        console.error(err);
      }
    },

    async loadTherapist(id: number): Promise<void> {
      try {
        const responseData: JSONTherapistDTO = (await axios.get(`http://localhost:8080/api/therapist/${id}`)).data;
        this.therapist = convertToTherapist(responseData);
      } catch (err) {
        console.error(err);
      }
    },

    async addTherapist(therapist: Therapist): Promise<void> {
      try {
        const therapistDTO = convertToTherapistDTO(therapist);
        await axios.post('http://localhost:8080/api/therapists', therapistDTO);
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },

    async updateTherapist(id: number, therapist: Therapist): Promise<void> {
      try {
        const therapistDTO = convertToTherapistDTO(therapist);
        await axios.put(`http://localhost:8080/api/therapists/${id}`, therapistDTO);
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },

    async deleteTherapist(id: number): Promise<void> {
      try {
        await axios.delete(`http://localhost:8080/api/therapists/${id}`);
        this.loadTherapists();
      } catch (err) {
        console.error(err);
      }
    },
  },

  getters: {
    getAllTherapists: (state) => state.therapists,
    getTherapistById: (state) => {
      return (id: number) => state.therapists.find(therapist => therapist.id === id);
    },
  },
});
