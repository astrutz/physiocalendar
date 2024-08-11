<template>
  <v-card>
    <v-card-title class="text-h5">Patient hinzufügen</v-card-title>
    <!-- Formular für die Patientenerstellung -->
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
            :value="formatDate(patientInput.activeSince)"
            clearable
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            label="Aktiv bis"
            :value="formatDate(patientInput.activeUntil)"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
    <!-- Dialog-Steuerung -->
    <v-card-actions>
      <v-btn color="error" @click="cancelChanges">Abbrechen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="success" @click="saveChanges">Patient Erstellen</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { v4 as uuidv4 } from 'uuid';
import Patient from '@/class/Patient';

@Component
export default class CreatePatient extends Vue {
  @Prop() private patient!: Patient;

  patientInput: Patient = {
    id: '',
    firstName: '',
    lastName: '',
    activeSince: new Date(),
    activeUntil: new Date('2050-01-01'),
    isBWO: false,
  };

  // Methode zum Schließen des Dialogs und Abbrechen der Bearbeitung
  cancelChanges(): void {
    this.$emit('cancel');
  }

  // Methode zum Schließen des Dialogs und Speichern der Änderungen
  saveChanges(): void {
    if (!this.patientInput.firstName || !this.patientInput.lastName) {
      // Überprüfen, ob Vorname und Nachname ausgefüllt sind
      // eslint-disable-next-line no-alert
      alert('Vorname und Nachname sind erforderlich.');
      return;
    }
    this.patientInput.id = this.generatePatientId();
    // Speichern des neuen Patienten im Store oder an einem anderen Speicherort
    // Hier können Sie den Patienten in Ihrem Store speichern, indem Sie eine Aktion auslösen
    this.$emit('save', { patient: this.patientInput });
  }

  // Methode zum Generieren einer neuen PatientId
  // eslint-disable-next-line class-methods-use-this
  generatePatientId(): string {
    return uuidv4();
  }

  // Methode zur Formatierung des Datums
  // eslint-disable-next-line class-methods-use-this
  formatDate(date: Date | undefined): Date {
    if (!date) return new Date; // Sicherstellen, dass ein gültiges Date-Objekt vorhanden ist
    //const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date;
  }
}
</script>
