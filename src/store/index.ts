import Vue from 'vue';
import Vuex from 'vuex';
import TherapistStore from './therapistStore';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
      TherapistStore,
      // Weitere Module hier
    },
  });
