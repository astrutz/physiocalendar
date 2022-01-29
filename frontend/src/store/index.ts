import Vue from 'vue';
import Vuex from 'vuex';
import StoreBackup from './backup';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    StoreBackup,
  },
});
