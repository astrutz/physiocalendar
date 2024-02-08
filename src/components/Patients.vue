<template>
  <v-card>
    <v-card-title class="text-h5"> Patienten verwalten </v-card-title>
    <!-- Suchfeld -->
    <v-card-text class="pt-5">
      <v-row>
        <v-text-field v-model="search" label="Suche" clearable @input="filterPatients"/>
      <v-btn color="green" @click="createPatient"> <v-icon color="white">mdi-plus</v-icon></v-btn>
    </v-row>
    <v-row>
      <!-- Tabelle mit Patienten -->
    <v-data-table
      :headers="headers"
      :items="filteredPatients"
      item-key="id"
      @click:row="showDetail"
    >
      <!-- Formatieren der Datums- und isBWO-Spalten -->
      <template v-slot:item.activeSince="{ item }">
        {{ formatDate(item.activeSince) }}
      </template>
      <template v-slot:item.activeUntil="{ item }">
        {{ formatDate(item.activeUntil) }}
      </template>
      <template v-slot:item.isBWO="{ item }">
        <v-icon v-if="item.isBWO" color="green">mdi-check</v-icon>
      </template>
    </v-data-table>
  </v-row>
    </v-card-text>
    <!-- PatientDetail-Komponente -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card>
        <PatientDetail
          :patient="selectedPatient"
          :appointments="selectedPatientAppointments"
          @save="savePatientChanges"
          @cancel="closeDetailDialog"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PatientDetail from '@/components/PatientDetail.vue';
import Patient from '@/class/Patient';
import Appointment from '@/class/Appointment';
import { Time } from '@/class/Enums';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component({
  components: {
    PatientDetail,
  },
})

export default class Patients extends Vue {
  // Tabellenheader
  headers = [
    { text: 'Vorname', value: 'firstName' },
    { text: 'Nachname', value: 'name' },
    { text: 'ID', value: 'id' },
    { text: 'Aktiv seit', value: 'activeSince' },
    { text: 'Aktiv bis', value: 'activeUntil' },
    { text: 'BWO', value: 'isBWO' },
  ];

  store = getModule(Store);

  detailDialog = false;

  selectedPatient: Patient | null = null;

  selectedPatientAppointments: Appointment[] = [];

  patients: Patient[] = [];

  filteredPatients: Patient[] = [];

  search = '';

  async created(): Promise<void> {
    // Warten, bis die Patientendaten geladen sind
    await this.loadPatients();
  }

  async loadPatients(): Promise<void> {
    this.patients = await this.store.getPatients();
    console.log(this.patients);
    this.filteredPatients = [...this.patients];
  }

  // Methode zum Öffnen der Detailansicht
  async showDetail(patient: Patient): Promise<void> {
    // Warten, bis die Patientendaten geladen sind
    await this.loadPatients();
    this.selectedPatient = patient;
    // Annahme: Funktion zum Abrufen von Terminen für einen Patienten
    this.getAppointmentsForPatient(patient);
    this.detailDialog = true;
  }

  getAppointmentsForPatient(patient: Patient): void {
    const exampleAppointments: Appointment[] = this.store.getAppointmentsForPatient(patient);
    this.selectedPatientAppointments = exampleAppointments;
  }

  // Methode zum Filtern der Patientenliste basierend auf dem Suchbegriff
  filterPatients(): void {
    const searchTerm = this.search.toLowerCase();
    // eslint-disable-next-line
    this.filteredPatients = this.patients.filter((patient) => {
      return patient.firstName.toLowerCase().includes(searchTerm) || patient.name.toLowerCase().includes(searchTerm);
    });
  }

  // Methode zum Schließen der Detailansicht
  closeDetailDialog(): void {
    this.detailDialog = false;
    this.selectedPatient = null;
    this.selectedPatientAppointments = [];
  }

  // Methode zum Speichern der Änderungen des Patienten
  savePatientChanges(): void {
    // Hier die Logik zum Speichern der Patientenänderungen implementieren
    this.closeDetailDialog();
  }

  // Methode zum Speichern der Änderungen des Patienten
  createPatient(): void {
    // Hier die Logik zum Speichern der Patientenänderungen implementieren
    this.closeDetailDialog();
  }

  // eslint-disable-next-line class-methods-use-this
  formatDate(date: Date | undefined): string {
    if (!date) return ''; // Sicherstellen, dass ein gültiges Date-Objekt vorhanden ist
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('de-DE' as string, options); // Typumwandlung zu string
  }
}
</script>
