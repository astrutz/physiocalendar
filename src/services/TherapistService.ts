import axios from 'axios';
import { JSONTherapistDTO } from '@/class/JSONStructures';

const API_URL = 'http://localhost:8080/api';

export default {
  async getTherapists(): Promise<JSONTherapistDTO[]> {
    const response = await axios.get<JSONTherapistDTO[]>(`${API_URL}/therapists`);
    return response.data;
  },
  async createTherapist(therapist: JSONTherapistDTO): Promise<JSONTherapistDTO> {
    const response = await axios.post<JSONTherapistDTO>(`${API_URL}/therapists`, therapist);
    return response.data;
  },
  async updateTherapist(id: string, therapist: JSONTherapistDTO): Promise<JSONTherapistDTO> {
    const response = await axios.put<JSONTherapistDTO>(`${API_URL}/therapists/${id}`, therapist);
    return response.data;
  },
  async deleteTherapist(id: string): Promise<void> {
    await axios.delete(`${API_URL}/therapists/${id}`);
  },
};
