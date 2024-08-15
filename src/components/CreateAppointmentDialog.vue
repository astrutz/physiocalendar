<template>
    <v-dialog persistent v-model="dialogIsOpen" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Neuen Termin erstellen - {{ appointment.therapist.name }}
        </v-card-title>
  
        <v-card-text class="pt-4">
          <v-switch v-model="isSeries" label="Serientermin"></v-switch>
  
          <single-appointment-dialog
            v-if="!isSeries"
            :therapist="appointment.therapist"
            :currentDay="currentDay"
            @save="saveSingleAppointment"
          />
  
          <appointment-series-dialog
            v-if="isSeries"
            :therapist="appointment.therapist"
            :currentDay="currentDay"
            @save="saveSeriesAppointment"
          />
        </v-card-text>
  
        <v-card-actions>
          <v-btn color="normal" text @click="dialogIsOpen = false">Abbrechen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import SingleAppointmentDialog from './SingleAppointmentDialog.vue';
  import AppointmentSeriesDialog from './AppointmentSeriesDialog.vue';
  import Appointment from '@/class/Appointment';
  
  @Component({
    components: {
      SingleAppointmentDialog,
      AppointmentSeriesDialog,
    },
  })
  
  export default class CreateAppointmentDialog extends Vue {
    @Prop({ required: true }) currentDay!: string;
    @Prop({ required: true }) appointment!: Appointment; // Das Appointment wird als Prop übergeben
  
    public dialogIsOpen = false;
    public isSeries = false;
  
    public saveSingleAppointment(appointment: any): void {
      this.$emit('saveSingle', appointment);
      this.dialogIsOpen = false;
    }
  
    public saveSeriesAppointment(appointment: any): void {
      this.$emit('saveSeries', appointment);
      this.dialogIsOpen = false;
    }
  }
  </script>
  