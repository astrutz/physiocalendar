<template>
  <v-card>
    <!-- Ladeanzeige, falls Daten geladen werden -->
    <v-progress-circular v-if="loading" indeterminate></v-progress-circular>
    
    <!-- Fehlermeldung, falls ein Fehler aufgetreten ist -->
    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <v-card-title>
      Patienten verwalten
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDetailDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pt-5">
      <v-row>
        <v-text-field v-model="search" label="Suche" clearable @input="filterPatients" />
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

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="closeDetailDialog">Abbrechen</v-btn>
    </v-card-actions>

    <!-- Dialoge für die Patientenverwaltung -->
    <v-dialog v-model="createPatientDialog" max-width="600">
      <v-card>
        <CreatePatient @save="createPatient" @cancel="closeCreatePatientDialog" />
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" max-width="600">
      <v-card v-if="selectedPatient">
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
import { defineComponent, ref, onMounted, computed } from 'vue';
import PatientDetail from '@/components/PatientDetail.vue';
import CreatePatient from '@/components/CreatePatient.vue';
import { usePatientStore } from '@/store/PatientStore';
import Patient from '@/class/Patient';

export default defineComponent({
  components: {
    PatientDetail,
    CreatePatient,
  },
  setup() {
    const patientStore = usePatientStore();

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
    const selectedPatientAppointments = ref([]);
    const search = ref('');

    const loading = computed(() => patientStore.loading);
    const error = computed(() => patientStore.error);
    const patients = computed(() => patientStore.getAllPatients);
    const filteredPatients = ref([...patients.value]);

    onMounted(() => {
      loadPatients();
    });

    const loadPatients = async () => {
      await patientStore.loadPatients();
      filteredPatients.value = [...patients.value];
    };

    const showDetail = async (patient: Patient) => {
      selectedPatient.value = patient;
      // Assuming the store fetches appointments if needed, otherwise adapt as needed
      selectedPatientAppointments.value = []; // Fetch appointments as needed
      detailDialog.value = true;
    };

    const savePatientChanges = async (event: { patient: Patient }) => {
      if (event.patient) {
        await patientStore.updatePatient(event.patient.id, event.patient);
        await loadPatients();
        closeDetailDialog();
      }
    };

    const deletePatient = async (event: { patient: Patient }) => {
      if (event.patient) {
        await patientStore.deletePatient(event.patient.id);
        await loadPatients();
        closeDetailDialog();
      }
    };

    const createPatient = async (event: { patient: Patient }) => {
      if (event.patient) {
        await patientStore.addPatient(event.patient);
        await loadPatients();
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

    const formatDate = (date: Date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    return {
      headers,
      detailDialog,
      createPatientDialog,
      selectedPatient,
      selectedPatientAppointments,
      search,
      loading,
      error,
      filteredPatients,
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
