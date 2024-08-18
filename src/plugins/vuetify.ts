// src/plugins/vuetify.ts

import 'vuetify/styles'; // Importiert die Vuetify-Styles
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi'; // Falls du Material Design Icons verwendest

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6200ea',
          secondary: '#03dac6',
        },
      },
    },
  },
});

export default vuetify;
