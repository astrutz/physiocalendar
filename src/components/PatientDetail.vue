<template>
    <v-card>
      <v-card-title class="text-h5">Patient bearbeiten</v-card-title>

      <!-- Formular für die Patientenbearbeitung -->
      <v-card-text>
        <!-- Hier das Formular für die Bearbeitung der Patienteneigenschaften einfügen -->
        <!-- Zum Beispiel: Eingabefelder für Name, ID, etc. -->
      </v-card-text>

      <!-- Terminliste für den aktuellen Patienten -->
      <v-card-text>
        <h6 class="text-h6">Termine für {{ patient.name }}</h6>
        <v-list>
          <v-list-item v-for="(appointment, index) in appointments" :key="index">
            <v-list-item-title>{{ appointment.startTime }} - {{ appointment.endTime }}</v-list-item-title>
            <!-- Hier weitere Informationen zu jedem Termin anzeigen -->
          </v-list-item>
        </v-list>
      </v-card-text>

      <!-- Dialog-Steuerung -->
      <v-card-actions>
        <v-btn color="primary" @click="saveChanges">Speichern</v-btn>
        <v-btn color="error" @click="cancelChanges">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>
  </template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Appointment from '@/class/Appointment';
import Patient from '@/class/Patient';

@Component
export default class PatientDetail extends Vue {
  @Prop({ required: true }) patient!: Patient;

  @Prop({ required: true }) appointments!: Appointment[];

  // Methode zum Schließen des Dialogs und Abbrechen der Bearbeitung
  cancelChanges(): void {
    this.$emit('cancel');
  }

  // Methode zum Schließen des Dialogs und Speichern der Änderungen
  saveChanges(): void {
    // Hier kannst du die Logik zum Speichern der Änderungen implementieren
    this.$emit('save');
  }
}
</script>

