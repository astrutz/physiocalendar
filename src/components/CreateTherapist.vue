<template>
  <v-card>
    <v-card-title class="text-h5">Therapeut hinzufügen</v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <v-text-field label="Name" v-model="therapistInput.name" clearable required></v-text-field>
        </v-col>
  
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            label="Aktiv seit"
            v-model="therapistInput.activeSince"
            type="date"
            clearable
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            label="Aktiv bis"
            v-model="therapistInput.activeUntil"
            type="date"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn color="error" @click="cancelChanges">Abbrechen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="saveChanges">Patient Erstellen</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Patient from '@/class/Patient';
import Therapist from '@/class/Therapist';
import Cancellation from '@/class/Cancellation';

export default defineComponent({
  props: {
    patient: {
      type: Object as () => Patient,
      required: false,
    },
  },
  setup(props, { emit }) {
    const therapistInput = ref<Therapist>({
      id: 0,
      name: '',
      activeSince: new Date(),
      activeUntil: new Date('2050-01-01'),
      absences: [],
      absenceIds: [],
      absenceExceptions: [],
      absenceExceptionIds: [],
    });

    const cancelChanges = () => {
      emit('cancel');
    };

    const saveChanges = () => {
      if (!therapistInput.value.name) {
        alert('Vorname und Nachname sind erforderlich.');
        return;
      }
      emit('save', { therapist: therapistInput.value });
    };

    return {
      therapistInput,
      cancelChanges,
      saveChanges,
    };
  },
});
</script>
