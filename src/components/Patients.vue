<template>
    <div>
      <!-- Suchfeld -->
    <v-text-field v-model="search" label="Suche" clearable @input="filterPatients" />
      <!-- Tabelle mit Patienten -->
      <v-data-table
      :headers="headers"
      :items="filteredPatients"
      item-key="id"
      @click:row="showDetail"
    >
      <template v-slot:item-activeSince="{ item }">
        {{ formatDate(item.activeSince) }}
      </template>
      <template v-slot:item-activeUntil="{ item }">
        {{ formatDate(item.activeUntil) }}
      </template>
      <template v-slot:item-isBWO="{ item }">
        <v-icon v-if="item.isBWO" color="green">mdi-check</v-icon>
      </template>
    </v-data-table>

      <!-- PatientDetail-Komponente -->
      <v-dialog v-model="detailDialog">
      <v-card>
        <PatientDetail
        :patient="selectedPatient"
        :appointments="selectedPatientAppointments"
        @save="savePatientChanges"
        @cancel="closeDetailDialog"
        />
      </v-card>
    </v-dialog>
    </div>
  </template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PatientDetail from '@/components/PatientDetail.vue';
import Patient from '@/class/Patient';
import Appointment from '@/class/Appointment';
import { Time } from '@/class/Enums';

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

  detailDialog = false;

  selectedPatient: Patient | null = null;

  selectedPatientAppointments: Appointment[] = [];

  // Deklaration der gefilterten Patienten
  filteredPatients: Patient[] = [];

  search = '';

  // Testpatienten
  patients: Patient[] = [
    new Patient('Max', 'Mustermann', '1', new Date('2023-01-01'), new Date('2023-12-31'), true),
    new Patient('Erika', 'Musterfrau', '2', new Date('2023-02-01'), new Date('2023-12-31'), false),
    // Füge weitere Patienten hier hinzu...
  ];

  mounted(): void {
    // Initialisierung der gefilterten Patienten beim Laden der Komponente
    this.filteredPatients = [...this.patients];
  }

  // Methode zum Öffnen der Detailansicht
  showDetail(patient: Patient): void {
    this.selectedPatient = patient;
    // Annahme: Funktion zum Abrufen von Terminen für einen Patienten
    this.getAppointmentsForPatient(patient);
    this.detailDialog = true;
  }

  getAppointmentsForPatient(patient: Patient): void {
    const exampleAppointments: Appointment[] = [
      new Appointment(
        'Dr. Müller',
        'therapist123',
        patient.firstName,
        Time['10:00'],
        Time['10:30'],
        'Routineuntersuchung',
      ),
      new Appointment(
        'Dr. Müller',
        'therapist123',
        patient.firstName,
        Time['10:00'],
        Time['10:30'],
        'Routineuntersuchung',
      ),
      new Appointment(
        'Dr. Müller',
        'therapist123',
        patient.firstName,
        Time['10:00'],
        Time['10:30'],
        'Routineuntersuchung',
      ),
      new Appointment(
        'Dr. Müller',
        'therapist123',
        patient.firstName,
        Time['10:00'],
        Time['10:30'],
        'Routineuntersuchung',
      ),
    ];
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

  // eslint-disable-next-line class-methods-use-this
  formatDate(date: Date | undefined): string {
    if (!date) return ''; // Sicherstellen, dass ein gültiges Date-Objekt vorhanden ist
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('de-DE' as string, options); // Typumwandlung zu string
  }
}
</script>
