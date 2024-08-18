<template>
  <v-card>
    <v-card-title class="text-h5">Patient bearbeiten</v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <v-text-field label="ID" :disabled="true" v-model="patientInput.id" clearable></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Vorname" v-model="patientInput.firstName" clearable></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Nachname" v-model="patientInput.lastName" clearable></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-checkbox label="BWO" v-model="patientInput.isBWO"></v-checkbox>
        </v-col>
        <v-col>
          <v-text-field label="Aktiv seit" :value="formatDate(patientInput.activeSince)" clearable></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Aktiv bis" :value="formatDate(patientInput.activeUntil)" clearable></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <h6 class="text-h6">Termine für {{ patientInput.lastName + ', ' + patientInput.firstName}}</h6>
      </v-row>
      <v-row>
        <v-list>
          <v-list-item v-for="(appointment, index) in appointments" :key="index">
            <v-list-item-title>{{ formatDate(appointment.startTime) }} - {{ formatDate(appointment.endTime) }}</v-list-item-title>
            <!-- Weitere Termininformationen anzeigen -->
          </v-list-item>
        </v-list>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="cancelChanges">Abbrechen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="deletePatient">Patient löschen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="saveChanges">Speichern</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import Patient from '@/class/Patient';
import Appointment from '@/class/Appointment';

export default defineComponent({
  props: {
    patient: {
      type: Object as () => Patient,
      required: true,
    },
    appointments: {
      type: Array as () => Appointment[],
      required: true,
    },
  },
  setup(props, { emit }) {
    const patientInput = ref<Patient>({ ...props.patient });

    watch(
      () => props.patient,
      (newPatient) => {
        patientInput.value = { ...newPatient };
      },
      { immediate: true }
    );

    const cancelChanges = () => {
      emit('cancel');
    };

    const saveChanges = () => {
      emit('save', { patient: patientInput.value });
    };

    const deletePatient = () => {
      emit('deletePatient', { patient: patientInput.value });
    };

    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    return {
      patientInput,
      cancelChanges,
      saveChanges,
      deletePatient,
      formatDate,
    };
  },
});
</script>
