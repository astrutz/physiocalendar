// src/services/TherapistService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export default {
  async getTherapists() {
    const response = await axios.get(`${API_URL}/therapists`);
    return response.data;
  },
  async createTherapist(therapist) {
    const response = await axios.post(`${API_URL}/therapists`, therapist);
    return response.data;
  },
  async updateTherapist(id, therapist) {
    const response = await axios.put(`${API_URL}/therapists/${id}`, therapist);
    return response.data;
  },
  async deleteTherapist(id) {
    await axios.delete(`${API_URL}/therapists/${id}`);
  },
};
