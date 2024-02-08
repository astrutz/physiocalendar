<template>
    <v-card>
      <v-card-title class="text-h5">Patient bearbeiten</v-card-title>
      <!-- Formular für die Patientenbearbeitung -->
    <v-card-text>
      <v-row>
        <v-col>
          <v-text-field label="ID" :disabled="true" :value="patient.id" v-model="patientInput.id" clearable></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Vorname" :value="patient.firstName" v-model="patientInput.firstName" clearable></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Nachname" :value="patient.name" v-model="patientInput.name" clearable></v-text-field>
        </v-col>
    </v-row>
    <v-row>
        <v-col>
          <v-checkbox label="BWO" v-model="patientInput.isBWO"></v-checkbox>
        </v-col>
        <v-col>
          <v-text-field
          label="Aktiv seit"
          :value="formatDate(patient.activeSince)"
          v-model="patientInput.activeSince"
          clearable></v-text-field>
        </v-col>
        <v-col >
          <v-text-field
          label="Aktiv bis"
          :value="formatDate(patient.activeUntil)"
          v-model="patientInput.activeUntil"
          clearable></v-text-field>
        </v-col>
    </v-row>
    <v-spacer></v-spacer>
    <v-row>
      <h6 class="text-h6">Termine für {{ patient.name }}</h6>
    </v-row>
    <v-row>
      <v-list>
        <v-list-item v-for="(appointment, index) in appointments" :key="index">
          <v-list-item-title>{{ appointment.startTime }} - {{ appointment.endTime }}</v-list-item-title>
          <!-- Hier weitere Informationen zu jedem Termin anzeigen -->
        </v-list-item>
      </v-list>
    </v-row>
    </v-card-text>
      <!-- Dialog-Steuerung -->
      <v-card-actions>
        <v-btn color="error" @click="cancelChanges">Abbrechen</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="saveChanges">Speichern</v-btn>
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

  patientInput: Patient = { ...this.patient };

  // Methode zum Schließen des Dialogs und Abbrechen der Bearbeitung
  cancelChanges(): void {
    this.$emit('cancel');
  }

  // Methode zum Schließen des Dialogs und Speichern der Änderungen
  saveChanges(): void {
    // Hier kannst du die Logik zum Speichern der Änderungen implementieren
    this.$emit('save');
  }

  // eslint-disable-next-line class-methods-use-this
  formatDate(date: Date | undefined): string {
    if (!date) return ''; // Sicherstellen, dass ein gültiges Date-Objekt vorhanden ist
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('de-DE' as string, options); // Typumwandlung zu string
  }
}
</script>
