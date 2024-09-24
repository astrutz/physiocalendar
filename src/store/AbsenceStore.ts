import { defineStore } from 'pinia';
import Absence from '@/class/Absence';
import { JSONAbsenceDTO } from '@/class/JSONStructures';
import { convertToAbsence, convertToAbsenceDTO } from './convert';
import { toast } from 'vue3-toastify';
import apiClient from './apiClient';

export const useAbsenceStore = defineStore('absence', {
  state: () => ({
    absences: [] as Absence[],
  }),

  actions: {
    async loadAbsences(therapistId: number): Promise<void> {
      try {
        const responseData: JSONAbsenceDTO[] = (await apiClient.get(`/absences/therapist/${therapistId}`)).data;
        if(responseData) {
          this.absences = responseData.map(dto => convertToAbsence(dto));
        }
      } catch (err) {
        console.error(err);
      }
    },

    async addAbsence(therapistId: number, absence: Absence): Promise<void> {
      try {
        const absenceDTO = convertToAbsenceDTO(absence);
        await apiClient.post(`/absences`, absenceDTO);
        toast.success("Abwesenheit erfolgreich erstellt");
        this.loadAbsences(therapistId);
      } catch (err) {
        console.error(err);
      }
    },

    async updateAbsence( id: number, absence: Absence): Promise<void> {
      try {
        const absenceDTO = convertToAbsenceDTO(absence);
        await apiClient.put(`absences/${id}`, absenceDTO);
        toast.success("Abwesenheit erfolgreich gespeichert");
        this.loadAbsences(absence.therapistId);
      } catch (err) {
        console.error(err);
      }
    },

    async deleteAbsence(therapistId: number, absenceId: number): Promise<void> {
      try {
        await apiClient.delete(`absences/${absenceId}`);
        toast.success("Abwesenheit erfolgreich gelöscht");
        this.loadAbsences(therapistId);
      } catch (err) {
        console.error(err);
      }
    },

    async isTherapistAbsent(therapistId: number, date: Date): Promise<boolean> {
      try {
        const responseData = (await apiClient.get(`absences?therapistId=${therapistId}&date=${encodeURIComponent(date.getTime())}`)).data;
        return responseData.length > 0; // If there are any absences, the therapist is absent
      } catch (err) {
        console.error('Fehler beim Überprüfen der Abwesenheit:', err);
        toast.error('Fehler beim Überprüfen der Abwesenheit.');
        return false;
      }
    }    
  },

  getters: {
    getAllAbsences: (state) => state.absences,

    getAbsencetById: (state) => (id: number) => {
      return state.absences.filter(absence => absence.id === id);
    },

    getAbsencesForTherapist: (state) => (id: number) => {
      return state.absences.filter(absence => absence.therapistId === id) || [];
    },

  },
});
