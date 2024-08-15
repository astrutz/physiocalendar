<template>
    <v-dialog persistent v-model="dialogIsOpen" width="800">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Einzeltermin - {{ appointment.therapist.name }} - {{ currentDay }}
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
          <v-btn color="normal" text @click="closeDialog">Abbrechen</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="saveAppointment">Speichern</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
  import SingleAppointment from '@/class/SingleAppointment';
  import Dateconversions from '@/class/Dateconversions';
  
  @Component
  export default class SingleAppointmentDialog extends Vue {
    @Prop({ required: true }) currentDay!: string;
    @Prop({ required: true }) appointment!: SingleAppointment; // Das Appointment wird als Prop übergeben
  
    public dialogIsOpen = false;
    public searchValue = '';
    public times = Dateconversions.getAllTimes();
  
    get foundPatients(): string[] {
      return []; // Implementiere die Logik zur Suche von Patienten
    }
  
    public searchPatients(query: string): void {
      // Implementiere die Patientensuche
    }
  
    public saveAppointment(): void {
      this.$emit('save', this.appointment);
      this.closeDialog();
    }
  
    public closeDialog(): void {
      this.dialogIsOpen = false;
    }

    @Watch('appointment', { immediate: true, deep: true })
    onAppointmentChanged(newAppointment: SingleAppointment): void {
    // Wenn sich das Appointment ändert, initialisiere die Felder erneut
    this.initializeAppointment(newAppointment);
  }

  private initializeAppointment(appointment: SingleAppointment): void {
    // Hier kannst du weitere Initialisierungen vornehmen, falls nötig
    this.appointment = appointment;
  }
  }
  </script>
  