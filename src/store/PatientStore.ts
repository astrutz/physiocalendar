import { defineStore } from 'pinia';
import axios from 'axios';
import Patient from '@/class/Patient';
import { JSONPatientDTO } from '@/class/JSONStructures';
import { convertToPatient, convertToPatientDTO } from './convert';

export const usePatientStore = defineStore('patientStore', {
  state: () => ({
    patients: [] as Patient[],
  }),
  actions: {
    async loadPatients(): Promise<void> {
      try {
        const responseData: JSONPatientDTO[] = (await axios.get('http://localhost:8080/api/patients')).data;
        this.patients = responseData.map(dto => convertToPatient(dto));
      } catch (err) {
        console.error(err);
      }
    },
    findPatientsByName(searchQuery: string): Patient[] {
      const queryLower = searchQuery.toLowerCase();
      return this.patients.filter(
        patient =>
          patient.firstName.toLowerCase().includes(queryLower) ||
          patient.lastName.toLowerCase().includes(queryLower)
      );
    },
    async addPatient(patient: Patient): Promise<void> {
      try {
        const patientDTO = convertToPatientDTO(patient);
        await axios.post('http://localhost:8080/api/patients', patientDTO);
        this.loadPatients();
      } catch (err) {
        console.error(err);
      }
    },
    async updatePatient(id: number, patient: Patient): Promise<void> {
      try {
        const patientDTO = convertToPatientDTO(patient);
        await axios.put(`http://localhost:8080/api/patients/${id}`, patientDTO);
        this.loadPatients();
      } catch (err) {
        console.error(err);
      }
    },
    async deletePatient(id: number): Promise<void> {
      try {
        await axios.delete(`http://localhost:8080/api/patients/${id}`);
        this.loadPatients();
      } catch (err) {
        console.error(err);
      }
    },
  },
  getters: {
    getAllPatients: (state) => state.patients,
  },
});
