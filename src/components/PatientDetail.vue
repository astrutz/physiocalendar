<template>
  <v-card>
    <v-card-title class="text-h5 d-flex justify-space-between">
      Patient bearbeiten
      <v-btn icon @click="cancelChanges">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text v-if="patientInput">
      <v-row>
        <v-col>
          <v-text-field label="Vorname" v-model="patientInput.firstName" clearable></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field label="Nachname" v-model="patientInput.lastName" clearable></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field label="Aktiv seit" v-model="patientInput.activeSince" :value="formatDate(patientInput.activeSince)" clearable></v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Aktiv bis" v-model="patientInput.activeUntil" :value="formatDate(patientInput.activeUntil)" clearable></v-text-field>
        </v-col>
        <v-col cols="auto">
          <v-checkbox label="BWO" v-model="patientInput.isBWO"></v-checkbox>
        </v-col>
      </v-row>
       <!-- Tab Selector für Termine -->
       <v-tabs v-model="activeTab">
        <v-tab>Einzeltermine</v-tab>
        <v-tab>Serientermine</v-tab>
      </v-tabs>

      <v-tabs-items v-model="activeTab">
        <!-- Einzeltermine -->
        <v-tab-item v-if="activeTab === 0">

          <v-row>
            <v-data-table
              :headers="appointmentHeaders"
              :items="appointments"
              item-key="id"
              :loading="loadingAppointments"
              :loading-text="'Laden...'"
            >
              <template v-slot:item.startTime="{ item }">
                {{ formatDate(item.startTime) }}
              </template>
              <template v-slot:item.endTime="{ item }">
                {{ formatDate(item.endTime) }}
              </template>
              <template v-slot:item.therapist="{ item }">
                {{ item.therapist.name }}
              </template>
            </v-data-table>
          </v-row>
        </v-tab-item>

        <!-- Serientermine -->
        <v-tab-item v-if="activeTab === 1">
          <v-row>
            <v-data-table
              :headers="appointmentSeriesHeaders"
              :items="appointmentSeries"
              item-key="id"
              :loading="loadingSeries"
              :loading-text="'Laden...'"
            >
              <template v-slot:item.startTime="{ item }">
                {{ formatDate(item.startTime) }}
              </template>
              <template v-slot:item.endTime="{ item }">
                {{ formatDate(item.endTime) }}
              </template>
              <template v-slot:item.therapist="{ item }">
                {{ item.therapist.name }}
              </template>
            </v-data-table>
          </v-row>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
    <v-card-actions>
      <v-btn color="grey" @click="cancelChanges">Abbrechen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="deletePatient">Patient löschen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="green" @click="saveChanges">Speichern</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import Patient from '@/class/Patient';
import Appointment from '@/class/Appointment';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { usePatientStore } from '@/store/PatientStore';
import AppointmentSeries from '@/class/AppointmentSeries';
import { useAppointmentSeriesStore } from '@/store/AppointmentSeriesStore';

export default defineComponent({
  props: {
    patientId: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const patientInput = ref<Patient | undefined>(undefined);
    const loadingAppointments = ref(true);
    const loadingSeries = ref(true);
    const appointments = ref<Appointment[]>([]);
    const appointmentSeries = ref<AppointmentSeries[]>([]);
    const activeTab = ref(0);

    const appointmentHeaders = ref([
      { title: 'Datum', value: 'date', sortable: true },
      { title: 'Von', value: 'startTime', sortable: true },
      { title: 'Bis', value: 'endTime', sortable: true },
      { title: 'Start Datum', value: 'startDate', sortable: true },
      { title: 'End Datum', value: 'endDate', sortable: true },
      { title: 'Kommentar', value: 'comment', sortable: true },
    ]);

    const appointmentSeriesHeaders = ref([
      { title: 'Wochentag', value: 'weekday', sortable: true },
      { title: 'Von', value: 'startTime', sortable: true },
      { title: 'Bis', value: 'endTime', sortable: true },
      { title: 'Start Datum', value: 'startDate', sortable: true },
      { title: 'End Datum', value: 'endDate', sortable: true },
      { title: 'Kommentar', value: 'comment', sortable: true },
      { title: 'Interval', value: 'weeklyFrequency', sortable: true },

    ]);

    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();
    const patientStore = usePatientStore();

    const loadAppointments = async () => {
      loadingAppointments.value = true;
      appointments.value = await appointmentStore.getAppointmentsForPatient(props.patientId);
      loadingAppointments.value = false;
    };

    const loadAppointmentSeries = async () => {
      loadingSeries.value = true;
      appointmentSeries.value = await appointmentSeriesStore.getAppointmentSeriesForPatient(props.patientId);
      loadingSeries.value = false;
    };

    onMounted(async () => {
      patientInput.value = await patientStore.getPatientById(props.patientId);
      await loadAppointments();
      await loadAppointmentSeries();
    });

    const cancelChanges = () => {
      emit('cancel');
    };

    const saveChanges = () => {
      if (patientInput.value) {
        emit('save', { patient: patientInput.value });
      }
    };

    const deletePatient = () => {
      if (patientInput.value) {
        emit('deletePatient', { patient: patientInput.value });
      }
    };

    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    const getAppointmentClass = (appointment: AppointmentSeries) => {
      return appointment.endDate ? 'series-appointment' : 'single-appointment';
    };

    return {
      patientInput,
      loadingAppointments,
      appointmentHeaders,
      appointmentSeriesHeaders,
      appointments,
      appointmentSeries,
      loadingSeries,
      activeTab,
      cancelChanges,
      saveChanges,
      deletePatient,
      formatDate,
      getAppointmentClass,
    };
  },
});
</script>

<style scoped>
.series-appointment {
  background-color: #34d685;
}

.single-appointment {
  background-color: #ffffff;
}
</style>
