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
          <VueDatePicker
            v-model="patientInput.activeSince"
            @change="handleDateSinceChange"
            text-input
            :format="formatDate"
            :format-locale="de"
          />
        </v-col>
        <v-col>
          <VueDatePicker
            v-model="patientInput.activeUntil"
            @change="handleDateUntilChange"
            :format="formatDate"
            :format-locale="de"
          />
        </v-col>
        <v-col cols="auto">
          <v-checkbox label="BWO" v-model="patientInput.isBWO"></v-checkbox>
        </v-col>
      </v-row>
      <v-spacer></v-spacer>
      <!-- Tab Selector für Termine -->
      <v-tabs v-model="activeTab">
        <v-tab>Einzeltermine</v-tab>
        <v-tab>Serientermine</v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
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
              <template #item.date="{ item }">
                {{ new Date(item.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
              </template>
              <template #item.startTime="{ item }">
                {{ formatTime(item.startTime) }}
              </template>
              <template #item.endTime="{ item }">
                {{ formatTime(item.endTime) }}
              </template>
              <template #item.therapist="{ item }">
                {{ item.therapist.firstName }}
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
              <template #item.weekday="{ item }">
                {{ item.weekday }}
              </template>
              <template #item.startTime="{ item }">
                {{ formatTime(item.startTime) }}
              </template>
              <template #item.endTime="{ item }">
                {{ formatTime(item.endTime) }}
              </template>
              <template #item.startDate="{ item }">
                {{ formatDate(item.startDate) }}
              </template>
              <template #item.endDate="{ item }">
                {{ formatDate(item.endDate) }}
              </template>
              <template #item.therapist="{ item }">
                {{ item.therapist.firstName }}
              </template>
              <template #item.weeklyFrequency="{ item }">
                {{ item.weeklyFrequency }}
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
      <v-btn color="primary" @click="printAppointments">Termine Drucken</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="green" @click="saveChanges">Speichern</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { usePatientStore } from '@/store/PatientStore';
import AppointmentSeries from '@/class/AppointmentSeries';
import { useAppointmentSeriesStore } from '@/store/AppointmentSeriesStore';
import SingleAppointment from '@/class/SingleAppointment';
import Patient from '@/class/Patient';
import { formatDate, formatTime } from '@/class/Dateconversions';
import { de } from 'date-fns/locale';
import Printer from '@/class/Printer';

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
    const appointments = ref<SingleAppointment[]>([]);
    const appointmentSeries = ref<AppointmentSeries[]>([]);
    const activeTab = ref(0);
    const printer = new Printer(props.patientId);

    const appointmentHeaders = ref([
      { title: 'Datum', value: 'date', sortable: true },
      { title: 'Von', value: 'startTime', sortable: true },
      { title: 'Bis', value: 'endTime', sortable: true },
      { title: 'Therapeut', value: 'therapist', sortable: true },
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
      appointments.value = await appointmentStore.getAppointmentsByPatientId(props.patientId);
      loadingAppointments.value = false;
    };

    const loadAppointmentSeries = async () => {
      loadingSeries.value = true;
      await appointmentSeriesStore.loadAppointmentSeries();
      appointmentSeries.value = await appointmentSeriesStore.getAppointmentSeriesByPatientId(props.patientId);
      console.log(appointmentSeries.value);
      loadingSeries.value = false;
    };

    onMounted(async () => {
      patientInput.value = await patientStore.getPatientById(props.patientId);
      await loadAppointments();
      await loadAppointmentSeries();
    });

    const handleDateSinceChange = (date: Date) => {
      if (patientInput.value) {
        patientInput.value.activeSince = date;
      }
    };

    const handleDateUntilChange = (date: Date) => {
      if (patientInput.value) {
        patientInput.value.activeUntil = date;
      }
    };

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

    const printAppointments = async () => {
      await printer.printPatientAppointments(); // Rufen Sie die Druckmethode auf
    };

    return {
      printAppointments,
      patientInput,
      de,
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
      formatTime,
      handleDateSinceChange,
      handleDateUntilChange,
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
