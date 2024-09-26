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
          <div class="v-label">Aktiv seit</div>
          <VueDatePicker
            v-model="patientInput.activeSince"
            @change="handleDateSinceChange"
            text-input
            teleport-center
            :format="formatDate"
            :format-locale="de"
          />
        </v-col>
        <v-col>
          <div class="v-label">Aktiv bis</div>
          <VueDatePicker
            v-model="patientInput.activeUntil"
            @change="handleDateUntilChange"
            :format="formatDate"
            :format-locale="de"
            teleport-center
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
            <template v-slot:item="{ item }">
              <tr @click="showSingleAppointmentDialog(item)" style="cursor: pointer;">
                <td>{{ item.therapist.firstName }}</td>
                <td>{{ formatDate(item.date) }}</td>
                <td>{{ formatTime(item.startTime) }}</td>
                <td>{{ formatTime(item.endTime) }}</td>
                <td>{{ item.comment }}</td>
              </tr>
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
            <template v-slot:item="{ item }">
              <tr @click="showAppointmentSeriesDialog(item)" style="cursor: pointer;">
                <td>{{ item.therapist.firstName }}</td>
                <td>{{ item.weekday }}</td>
                <td>{{ formatTime(item.startTime) }}</td>
                <td>{{ formatTime(item.endTime) }}</td>
                <td>{{ formatDate(item.startDate) }}</td>
                <td>{{ formatDate(item.endDate) }}</td>
                <td>{{ item.weeklyFrequency }}</td>
                <td>{{ item.comment }}</td>
              </tr>
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
      <v-btn color="primary" @click="openPrintDialog">Termine Drucken</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="green" @click="saveChanges">Speichern</v-btn>
    </v-card-actions>
    <v-dialog v-model="printDialogOpen" persistent class="resizable-dialog">
      <v-card v-if="patientInput">
        <PrintDialog
          :patientId="patientInput.id"
          @cancel="printDialogOpen = false"
        />
      </v-card>
    </v-dialog>
    <SingleAppointmentDialog
          v-if="selectedSingleAppointment"
          :appointment.sync="selectedSingleAppointment"
          :currentDay="new Date()"
          v-model="singleAppointmentDialog"
          @saveSingle="changeSingleAppointment"
          @deleteSingle="deleteSingleAppointment"
          @cancel="singleAppointmentDialog = false"
        />
        <AppointmentSeriesDialog
          v-if="selectedAppointmentSeries"
          :currentDay="new Date()"
          :appointment.sync="selectedAppointmentSeries"
          v-model="appointmentSeriesDialog"
          @saveSeries="changeSeriesAppointment"
          @cancel="appointmentSeriesDialog = false"
        />
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
import PrintDialog from './PrintDialog.vue';
import SingleAppointmentDialog from './SingleAppointmentDialog.vue';
import AppointmentSeriesDialog from './AppointmentSeriesDialog.vue';

export default defineComponent({
  components: {
    PrintDialog,
    SingleAppointmentDialog,
    AppointmentSeriesDialog,
  },
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
    const printDialogOpen = ref(false);
    const selectedSingleAppointment = ref<SingleAppointment | null>(null);
    const selectedAppointmentSeries = ref<AppointmentSeries | null>(null);
    const singleAppointmentDialog = ref(false);
    const appointmentSeriesDialog = ref(false);

    const appointmentHeaders = ref([
      { title: 'Therapeut', value: 'therapist', sortable: true },
      { title: 'Datum', value: 'date', sortable: true },
      { title: 'Von', value: 'startTime', sortable: true },
      { title: 'Bis', value: 'endTime', sortable: true },
      { title: 'Kommentar', value: 'comment', sortable: true },
    ]);

    const appointmentSeriesHeaders = ref([
      { title: 'Therapeut', value: 'therapist', sortable: true },
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

    const changeSingleAppointment = async (appointment: SingleAppointment) => {
       await appointmentStore.updateAppointment(appointment.id, appointment)
       loadAppointments();
    };

    const changeSeriesAppointment = (appointment: AppointmentSeries) => {
      appointmentSeriesStore.updateAppointmentSeries(appointment.id, appointment);
      loadAppointments();
    };

    const deleteSingleAppointment = async (appointment: SingleAppointment) => {
      await appointmentStore.deleteAppointment(appointment.id);
      loadAppointments();
    };

    const deleteSeriesAppointment = (id: number) => {
      appointmentSeriesStore.deleteAppointmentSeries(id);
      loadAppointments();
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

    const openPrintDialog = async () => {
      printDialogOpen.value = true;
    };

    const showSingleAppointmentDialog = (appointment: SingleAppointment) => {
      selectedSingleAppointment.value = appointment ; 
      singleAppointmentDialog.value = true;
    };

    const showAppointmentSeriesDialog = (appointmentSeries: AppointmentSeries) => {
      selectedAppointmentSeries.value = appointmentSeries;
      appointmentSeriesDialog.value = true;
    };

    return {
      patientInput,
      openPrintDialog,
      printDialogOpen,
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
      changeSingleAppointment,
      changeSeriesAppointment,
      deleteSingleAppointment,
      deleteSeriesAppointment,
      showSingleAppointmentDialog,
      showAppointmentSeriesDialog,
      singleAppointmentDialog,
      appointmentSeriesDialog,
      selectedSingleAppointment,
      selectedAppointmentSeries,
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
