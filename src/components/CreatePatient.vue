<template>
  <v-dialog persistent v-model="dialogIsOpen" width="600">
    <v-card>
      <v-card-title class="text-h5">Patient hinzufügen</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field label="Vorname" v-model="patientInput.firstName" clearable required></v-text-field>
          </v-col>
          <v-col>
            <v-text-field label="Nachname" v-model="patientInput.lastName" clearable required></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox label="BWO" v-model="patientInput.isBWO"></v-checkbox>
          </v-col>
          <v-col>
            <v-text-field
              label="Aktiv seit"
              v-model="patientInput.activeSince"
              type="date"
              clearable
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              label="Aktiv bis"
              v-model="patientInput.activeUntil"
              type="date"
              clearable
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="cancelChanges">Abbrechen</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="saveChanges">Patient Erstellen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Patient from '@/class/Patient';

export default defineComponent({
  props: {
    patient: {
      type: Object as () => Patient,
      required: false,
    },
  },
  setup(props, { emit }) {
    const dialogIsOpen = ref(false);
    const patientInput = ref<Patient>({
      id: 0,
      firstName: '',
      lastName: '',
      fullName: '',
      activeSince: new Date(),
      activeUntil: new Date('2050-01-01'),
      isBWO: false,
    });

    const cancelChanges = () => {
      emit('cancel');
    };

    const saveChanges = () => {
      if (!patientInput.value.firstName || !patientInput.value.lastName) {
        alert('Vorname und Nachname sind erforderlich.');
        return;
      }
      emit('save', patientInput.value);
    };

    return {
      patientInput,
      cancelChanges,
      saveChanges,
      dialogIsOpen,
    };
  },
});
</script>
