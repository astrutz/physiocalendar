<template>
  <v-dialog v-model="dialog" persistent max-width="1200px">
    <v-app-bar class="headline" color="#2a2f79" dark>
      <img src="@/assets/icon-inverted.png" height="50px" />
      <div class="d-flex align-center">
        <h1 class="text-h6">Physiokalender - Praxis Meyer 2.0</h1>
      </div>
    </v-app-bar>
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        <v-alert v-if="loginError" type="error">{{ loginError }}</v-alert>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="username"
            label="Benutzername"
            :rules="[rules.required]"
            required
            @keyup.enter="login"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Passwort"
            :rules="[rules.required]"
            type="password"
            required
            @keyup.enter="login"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="green" @click="login">Anmelden</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/store/authStore';

export default defineComponent({
  setup() {
    const authStore = useAuthStore();
    const dialog = ref(true);
    const username = ref('');
    const password = ref('');
    const valid = ref(false);
    const loginError = ref('');

    const rules = {
      required: (value: string) => !!value || 'Dieses Feld ist erforderlich',
    };

    const login = async () => {
      if (!valid.value) return;

      const success = await authStore.login(username.value, password.value);

      if (success) {
        dialog.value = false; // Dialog nur bei Erfolg schließen
      }
    };

    return {
      dialog,
      username,
      password,
      loginError,
      valid,
      rules,
      login,
    };
  },
});
</script>

<style scoped>
.v-card-text {
  margin-top: 80px;
  padding: 0px; /* Abstand zwischen Titel und Anmeldeformular */
}
</style>
