import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import '@mdi/font/css/materialdesignicons.css';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import axios from 'axios';
import 'toastify-js/src/toastify.css';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';

axios.defaults.baseURL = 'http://localhost:8080/api';

const app = createApp(App);
const pinia = createPinia();

app.component('VueDatePicker', VueDatePicker);
app.use(pinia);
app.use(vuetify);
app.use(Vue3Toastify, {
    autoClose: 3000,
  } as ToastContainerOptions);

app.mount('#app');
