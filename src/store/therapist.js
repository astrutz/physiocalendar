// src/store/therapists.js
import TherapistService from '../services/TherapistService';

export default {
  state: {
    therapists: [],
  },
  mutations: {
    setTherapists(state, therapists) {
      state.therapists = therapists;
    },
  },
  actions: {
    async fetchTherapists({ commit }) {
      try {
        const therapists = await TherapistService.getTherapists();
        commit('setTherapists', therapists);
      } catch (error) {
        console.error(error);
      }
    },
    async addTherapist({ dispatch }, therapist) {
      try {
        await TherapistService.createTherapist(therapist);
        dispatch('fetchTherapists');
      } catch (error) {
        console.error(error);
      }
    },
    async updateTherapist({ dispatch }, { id, therapist }) {
      try {
        await TherapistService.updateTherapist(id, therapist);
        dispatch('fetchTherapists');
      } catch (error) {
        console.error(error);
      }
    },
    async deleteTherapist({ dispatch }, id) {
      try {
        await TherapistService.deleteTherapist(id);
        dispatch('fetchTherapists');
      } catch (error) {
        console.error(error);
      }
    },
  },
  getters: {
    getAllTherapists: (state) => state.therapists,
  },
};
