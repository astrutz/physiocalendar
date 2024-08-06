<template>
  <v-card>
    <v-card-text class="pt-5">
      <v-row>
        <v-text-field v-model="search" label="Suche" clearable @input="filterPatients"/>
        <v-btn color="green" @click="openCreatePatientDialog">
          <v-icon color="white">mdi-plus</v-icon>
        </v-btn>
      </v-row>
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="filteredPatients"
      item-key="id"
      @click:row="showDetail"
    >
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

    <v-dialog v-model="createPatientDialog" max-width="600">
      <v-card>
        <CreatePatient @save="createPatient($event)" @cancel="closeCreatePatientDialog" />
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" max-width="600">
      <v-card>
        <PatientDetail
          :patient="selectedPatient"
          :appointments="selectedPatientAppointments"
          @save="savePatientChanges"
          @deletePatient="deletePatient($event)"
          @cancel="closeDetailDialog"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PatientDetail from '@/components/PatientDetail.vue';
import CreatePatient from '@/components/CreatePatient.vue';
import PatientService from '@/services/PatientService';
import Patient from '@/class/Patient';
import Appointment from '@/class/Appointment';

@Component({
  components: {
    PatientDetail,
    CreatePatient,
  },
})

export default class Patients extends Vue {
  headers = [
    { text: 'Vorname', value: 'firstName' },
    { text: 'Nachname', value: 'lastName' },
    { text: 'Aktiv seit', value: 'activeSince' },
    { text: 'Aktiv bis', value: 'activeUntil' },
    { text: 'BWO', value: 'isBWO' },
  ];

  detailDialog = false;
  createPatientDialog = false;
  selectedPatient: Patient | null = null;
  selectedPatientAppointments: Appointment[] = [];
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  search = '';

  async created(): Promise<void> {
    await this.loadPatients();
  }

  async loadPatients(): Promise<void> {
    this.patients = await PatientService.getAllPatients();
    this.filteredPatients = [...this.patients];
  }

  async showDetail(patient: Patient): Promise<void> {
    this.selectedPatient = patient;
    this.selectedPatientAppointments = await PatientService.getPatientAppointments(patient.id); // Wenn verfügbar
    this.detailDialog = true;
  }

  async savePatientChanges(event: { patient: Patient }): Promise<void> {
    if (event.patient) {
      await PatientService.updatePatient(event.patient.id, event.patient);
      this.loadPatients();
      this.closeDetailDialog();
    }
  }

  async deletePatient(event: { patient: Patient }): Promise<void> {
    if (event.patient) {
      await PatientService.deletePatient(event.patient.id);
      this.loadPatients();
      this.closeDetailDialog();
    }
  }

  async createPatient(event: { patient: Patient }): Promise<void> {
    if (event.patient) {
      await PatientService.createPatient(event.patient);
      this.loadPatients();
      this.closeCreatePatientDialog();
    }
  }

  closeDetailDialog(): void {
    this.detailDialog = false;
    this.selectedPatient = null;
    this.selectedPatientAppointments = [];
  }

  closeCreatePatientDialog(): void {
    this.createPatientDialog = false;
  }

  openCreatePatientDialog(): void {
    this.createPatientDialog = true;
  }

  filterPatients(): void {
    const searchTerm = this.search.toLowerCase();
    this.filteredPatients = this.patients.filter(
      patient => patient.firstName.toLowerCase().includes(searchTerm) || patient.lastName.toLowerCase().includes(searchTerm)
    );
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
}
</script>
