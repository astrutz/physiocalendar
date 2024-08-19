import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import '@mdi/font/css/materialdesignicons.css';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080/api';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);    

app.mount('#app');
