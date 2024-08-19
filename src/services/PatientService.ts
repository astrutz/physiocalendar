// src/services/PatientService.ts
import axios from 'axios';
import Patient from '@/class/Patient';
import SingleAppointment from '@/class/SingleAppointment';

const BASE_URL = 'http://localhost:4000/api/patients';

export default class PatientService {
  static async getAllPatients(): Promise<Patient[]> {
    const response = await axios.get(BASE_URL);
    return response.data;
  }

  static async getPatientById(id: number): Promise<Patient> {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  }

  static async createPatient(patient: Patient): Promise<Patient> {
    const response = await axios.post(BASE_URL, patient);
    return response.data;
  }

  static async updatePatient(id: number, patient: Patient): Promise<Patient> {
    const response = await axios.put(`${BASE_URL}/${id}`, patient);
    return response.data;
  }

  static async deletePatient(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  }

  static async getPatientAppointments(id: number): Promise<SingleAppointment[]> {
    // Implementieren Sie diese Methode, wenn das Backend dies unterstützt
    const response = await axios.get(`${BASE_URL}/${id}/appointments`);
    return response.data;
  }
}
