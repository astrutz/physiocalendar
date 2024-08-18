<template>
    <v-dialog persistent v-model="dialogIsOpen" width="800">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Serientermin - {{ appointment.therapist.name }} - {{ currentDay }}
        </v-card-title>
  
        <v-card-text class="pt-4">
          <v-combobox
            v-model="appointment.patient"
            :items="foundPatients"
            :search-input.sync="searchValue"
            @input="searchPatients($event)"
            label="Name des Patienten"
            clearable
          ></v-combobox>
  
          <v-select
            :items="times"
            label="Start um"
            v-model="appointment.startTime"
          ></v-select>
  
          <v-select
            :items="times"
            label="Ende um"
            v-model="appointment.endTime"
          ></v-select>
  
          <v-text-field
            label="Wöchentliches Intervall"
            type="number"
            v-model="appointment.weeklyFrequency"
          ></v-text-field>
  
          <v-date-picker
            v-model="appointment.startDate"
            label="Startdatum"
          ></v-date-picker>
  
          <v-date-picker
            v-model="appointment.endDate"
            label="Enddatum"
          ></v-date-picker>
  
          <v-text-field
            label="Sonstige Bemerkungen"
            v-model="appointment.comment"
            clearable
          ></v-text-field>
  
          <v-row>
            <v-col>
              <v-checkbox label="Heißluft" v-model="appointment.isHotair"></v-checkbox>
            </v-col>
            <v-col>
              <v-checkbox label="Ultraschall" v-model="appointment.isUltrasonic"></v-checkbox>
            </v-col>
            <v-col>
              <v-checkbox label="Elektro" v-model="appointment.isElectric"></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
  
        <v-divider></v-divider>
  
        <v-card-actions>
          <v-btn color="normal" @click="closeDialog">Abbrechen</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="saveAppointment">Speichern</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import AppointmentSeries from '@/class/AppointmentSeries';
  import Dateconversions from '@/class/Dateconversions';
  
  export default defineComponent({
    props: {
      appointment: {
        type: AppointmentSeries,
        required: true,
      },
      currentDay: {
        type: Date,
        required: true,
      },
    },
    setup(props, { emit }) {
      const dialogIsOpen = ref(false);
      const searchValue = ref('');
      const times = ref(Dateconversions.getAllTimes());
  
      const foundPatients = ref<string[]>([]); // Implementiere die Logik zur Suche von Patienten
  
      const searchPatients = (query: string) => {
        // Implementiere die Patientensuche
      };
  
      const saveAppointment = () => {
        emit('save', props.appointment);
        closeDialog();
      };
  
      const closeDialog = () => {
        dialogIsOpen.value = false;
      };
  
      return {
        dialogIsOpen,
        searchValue,
        times,
        foundPatients,
        searchPatients,
        saveAppointment,
        closeDialog,
      };
    },
  });
  </script>
  