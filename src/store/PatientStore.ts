import { defineStore } from 'pinia';
import axios from 'axios';
import Patient from '@/class/Patient';
import { JSONPatientDTO } from '@/class/JSONStructures';
import { convertToPatient, convertToPatientDTO } from './convert';
import { toast } from 'vue3-toastify';

export const usePatientStore = defineStore('patientStore', {
  state: () => ({
    patients: [] as Patient[],
    loading: false,  // loading state to manage the UI
    error: null as string | null,  // error state to handle any issues
  }),
  actions: {
    async loadPatients(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const responseData: JSONPatientDTO[] = (await axios.get('http://localhost:8080/api/patients')).data;
        this.patients = responseData.map(dto => convertToPatient(dto));
      } catch (err) {
        this.error = 'Failed to load patients';
        console.error(err);
      } finally {
        this.loading = false;
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
      this.loading = true;
      this.error = null;
      try {
        patient.fullName = patient.firstName + ' ' + patient.lastName;
        const patientDTO = convertToPatientDTO(patient);
        await axios.post('http://localhost:8080/api/patients', patientDTO);
        toast.success('Patient erfolgreich erstellt');
        await this.loadPatients();
      } catch (err) {
        this.error = 'Failed to add patient';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async updatePatient(id: number, patient: Patient): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        patient.fullName = patient.firstName + ' ' + patient.lastName;
        const patientDTO = convertToPatientDTO(patient);
        await axios.put(`http://localhost:8080/api/patients/${id}`, patientDTO);
        toast.success('Patient erfolgreich gespeichert');
        await this.loadPatients();
      } catch (err) {
        this.error = 'Failed to update patient';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async deletePatient(id: number): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await axios.delete(`http://localhost:8080/api/patients/${id}`);
        toast.success('Patient erfolgreich gelöscht');
        await this.loadPatients();
      } catch (err) {
        this.error = 'Failed to delete patient';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {

    getAllPatients: (state) => {
      return state.patients;
    },

    getPatientById: (state) => {
      return (id: number) => state.patients.find(patient => patient.id === id);
    },
  },
});
