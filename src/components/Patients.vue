<template>
  <v-card>
    <v-card-title>
      <v-row align="center">
        <v-col>
          Patienten verwalten
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text class="pt-5">
      <v-row align="center">
        <!-- Suchfeld -->
        <v-col>
          <v-text-field v-model="search" label="Suche" clearable @input="filterPatients" />
        </v-col>
        <!-- Plus Button -->
        <v-col cols="auto">
          <v-btn color="green" @click="openCreatePatientDialog">
            <v-icon color="white">mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="filteredPatients"
      item-key="id"
      :loading="loading"
      :loading-text="'Laden...'">

      <template v-slot:item="{ item }">
        <tr @click="showDetail(item)" style="cursor: pointer;">
          <td>{{ item.firstName }}</td>
          <td>{{ item.lastName }}</td>
          <td>{{ formatDate(item.activeSince) }}</td>
          <td>{{ formatDate(item.activeUntil) }}</td>
          <td>
            <v-icon v-if="item.isBWO" color="green">mdi-check</v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Fehlermeldung, falls ein Fehler aufgetreten ist -->
    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <v-card-actions>
      <v-btn color="grey" @click="closeDialog">Abbrechen</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>

    <!-- Dialoge für die Patientenverwaltung -->
    <v-dialog v-model="createPatientDialog" max-width="1500">
      <v-card>
        <CreatePatient @save="createPatient" @cancel="closeCreatePatientDialog" />
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" persistent class="resizable-dialog">
      <v-card v-if="selectedPatient">
        <PatientDetail
          :patientId="selectedPatient.id"
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
import { formatDate } from '@/class/Dateconversions';
import Patient from '@/class/Patient';

export default defineComponent({
  components: {
    PatientDetail,
    CreatePatient,
  },
  setup(props, { emit }) {
    const patientStore = usePatientStore();

    const headers = ref([
      { title: 'Vorname', value: 'firstName', sortable: true, filterable: true },
      { title: 'Nachname', value: 'lastName', sortable: true, filterable: true },
      { title: 'Aktiv seit', value: 'activeSince', sortable: true, filterable: true },
      { title: 'Aktiv bis', value: 'activeUntil', sortable: true, filterable: true },
      { title: 'BWO', value: 'isBWO', sortable: true, filterable: true },
    ]);

    const detailDialog = ref(false);
    const createPatientDialog = ref(false);
    const selectedPatient = ref<Patient | null>(null);
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

    const showDetail = (item: Patient) => {
      selectedPatient.value = item;
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
    };

    const closeCreatePatientDialog = () => {
      createPatientDialog.value = false;
    };

    const openCreatePatientDialog = () => {
      console.log('Patient hinzufügen');
      createPatientDialog.value = true;
    };

    const closeDialog = () => {
      emit('dialogClosed');
    };

    const filterPatients = () => {
      const searchTerm = search.value.toLowerCase();
      filteredPatients.value = patients.value.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(searchTerm) ||
          patient.lastName.toLowerCase().includes(searchTerm)
      );
    };

    return {
      headers,
      detailDialog,
      createPatientDialog,
      selectedPatient,
      search,
      loading,
      error,
      closeDialog,
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

<style>
.resizable-dialog .v-card {
  resize: both;
  overflow: auto;
}
</style>
