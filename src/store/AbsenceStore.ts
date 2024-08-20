import { defineStore } from 'pinia';
import axios from 'axios';
import Absence from '@/class/Absence';
import { JSONAbsenceDTO } from '@/class/JSONStructures';
import { convertToAbsence, convertToAbsenceDTO } from './convert';

export const useAbsenceStore = defineStore('absence', {
  state: () => ({
    absences: [] as Absence[],
  }),

  actions: {
    async loadAbsences(therapistId: number): Promise<void> {
      try {
        const responseData: JSONAbsenceDTO[] = (await axios.get(`http://localhost:8080/api/therapists/${therapistId}/absences`)).data;
        this.absences = responseData.map(dto => convertToAbsence(dto));
      } catch (err) {
        console.error(err);
      }
    },

    async addAbsence(therapistId: number, absence: Absence): Promise<void> {
      try {
        const absenceDTO = convertToAbsenceDTO(absence);
        await axios.post(`http://localhost:8080/api/therapists/${therapistId}/absences`, absenceDTO);
        this.loadAbsences(therapistId);
      } catch (err) {
        console.error(err);
      }
    },

    async updateAbsence(therapistId: number, absence: Absence): Promise<void> {
      try {
        const absenceDTO = convertToAbsenceDTO(absence);
        await axios.put(`http://localhost:8080/api/therapists/${therapistId}/absences/${absence.id}`, absenceDTO);
        this.loadAbsences(therapistId);
      } catch (err) {
        console.error(err);
      }
    },

    async deleteAbsence(therapistId: number, absenceId: number): Promise<void> {
      try {
        await axios.delete(`http://localhost:8080/api/therapists/${therapistId}/absences/${absenceId}`);
        this.loadAbsences(therapistId);
      } catch (err) {
        console.error(err);
      }
    },
  },

  getters: {
    getAllAbsences: (state) => state.absences,

    getAbsencetById: (state) => (absenceId: number) => {
      return state.absences.find(absence => absence.id === absenceId);
    },

    getAbsencesForTherapist: (state) => () => {
      return state.absences || [];
    },

  },
});
