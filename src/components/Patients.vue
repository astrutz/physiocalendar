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
        <CreatePatient @save="createPatient" @cancel="closeCreatePatientDialog" />
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" max-width="600">
      <v-card  v-if="selectedPatient">
        <PatientDetail
          :patient="selectedPatient"
          :appointments="selectedPatientAppointments"
          @save="savePatientChanges"
          @deletePatient="deletePatient"
          @cancel="closeDetailDialog"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import PatientDetail from '@/components/PatientDetail.vue';
import CreatePatient from '@/components/CreatePatient.vue';
import PatientService from '@/services/PatientService';
import Patient from '@/class/Patient';
import Appointment from '@/class/Appointment';

export default defineComponent({
  components: {
    PatientDetail,
    CreatePatient,
  },
  setup() {
    const headers = ref([
      { text: 'Vorname', value: 'firstName' },
      { text: 'Nachname', value: 'lastName' },
      { text: 'Aktiv seit', value: 'activeSince' },
      { text: 'Aktiv bis', value: 'activeUntil' },
      { text: 'BWO', value: 'isBWO' },
    ]);

    const detailDialog = ref(false);
    const createPatientDialog = ref(false);
    const selectedPatient = ref<Patient | null>(null);
    const selectedPatientAppointments = ref<Appointment[]>([]);
    const patients = ref<Patient[]>([]);
    const filteredPatients = ref<Patient[]>([]);
    const search = ref('');

    const loadPatients = async () => {
      patients.value = await PatientService.getAllPatients();
      filteredPatients.value = [...patients.value];
    };

    const showDetail = async (patient: Patient) => {
      selectedPatient.value = patient;
      selectedPatientAppointments.value = await PatientService.getPatientAppointments(patient.id);
      detailDialog.value = true;
    };

    const savePatientChanges = async (event: { patient: Patient }) => {
      if (event.patient) {
        await PatientService.updatePatient(event.patient.id, event.patient);
        loadPatients();
        closeDetailDialog();
      }
    };

    const deletePatient = async (event: { patient: Patient }) => {
      if (event.patient) {
        await PatientService.deletePatient(event.patient.id);
        loadPatients();
        closeDetailDialog();
      }
    };

    const createPatient = async (event: { patient: Patient }) => {
      if (event.patient) {
        await PatientService.createPatient(event.patient);
        loadPatients();
        closeCreatePatientDialog();
      }
    };

    const closeDetailDialog = () => {
      detailDialog.value = false;
      selectedPatient.value = null;
      selectedPatientAppointments.value = [];
    };

    const closeCreatePatientDialog = () => {
      createPatientDialog.value = false;
    };

    const openCreatePatientDialog = () => {
      createPatientDialog.value = true;
    };

    const filterPatients = () => {
      const searchTerm = search.value.toLowerCase();
      filteredPatients.value = patients.value.filter(
        patient =>
          patient.firstName.toLowerCase().includes(searchTerm) ||
          patient.lastName.toLowerCase().includes(searchTerm)
      );
    };

    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    onMounted(() => {
      loadPatients();
    });

    return {
      headers,
      detailDialog,
      createPatientDialog,
      selectedPatient,
      selectedPatientAppointments,
      patients,
      filteredPatients,
      search,
      loadPatients,
      showDetail,
      savePatientChanges,
      deletePatient,
      createPatient,
      closeDetailDialog,
      closeCreatePatientDialog,
      openCreatePatientDialog,
      filterPatients,
      formatDate,
    };
  },
});
</script>
