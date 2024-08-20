import { defineStore } from 'pinia';
import axios from 'axios';
import AbsenceException from '@/class/AbsenceException';
import { JSONAbsenceExceptionDTO } from '@/class/JSONStructures';
import { convertToAbsenceException, convertToAbsenceExceptionDTO } from './convert';

export const useAbsenceExceptionStore = defineStore('absenceExceptionStore', {
  state: () => ({
    absenceExceptions: [] as AbsenceException[],
  }),
  actions: {
    async loadAbsenceExceptions(therapistId: number): Promise<void> {
      try {
        const responseData: JSONAbsenceExceptionDTO[] = (await axios.get(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions`)).data;
        this.absenceExceptions = responseData.map(dto => convertToAbsenceException(dto));
      } catch (err) {
        console.error(err);
      }
    },
    async addAbsenceException(therapistId: number, absenceException: AbsenceException): Promise<void> {
      try {
        const absenceExceptionDTO = convertToAbsenceExceptionDTO(absenceException);
        await axios.post(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions`, absenceExceptionDTO);
        this.loadAbsenceExceptions(therapistId);
      } catch (err) {
        console.error(err);
      }
    },
    async updateAbsenceException(therapistId: number, absenceException: AbsenceException): Promise<void> {
      try {
        const absenceExceptionDTO = convertToAbsenceExceptionDTO(absenceException);
        await axios.put(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions/${absenceException.id}`, absenceExceptionDTO);
        this.loadAbsenceExceptions(therapistId);
      } catch (err) {
        console.error(err);
      }
    },
    async deleteAbsenceException(therapistId: number, absenceExceptionId: number): Promise<void> {
      try {
        await axios.delete(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions/${absenceExceptionId}`);
        this.loadAbsenceExceptions(therapistId);
      } catch (err) {
        console.error(err);
      }
    },
  },
  getters: {
    getAllAbsenceExceptions: (state) => state.absenceExceptions,
  },
});
