<template>
  <v-dialog persistent v-model="dialogIsOpen" width="600">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        <v-row>
          <v-col>
            Neuen Termin erstellen - {{ appointment.therapist.name }}
          </v-col>
          <v-col cols="auto">
            <v-switch v-model="isSeries" label="Serientermin"></v-switch>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Einzeltermin Felder -->
        <div v-if="!isSeries">
          <v-form>
            <v-text-field
              v-model="singleAppointment.patient.firstName"
              label="Patient suchen"
              @click:append="showPatientSearchDialog"
              :append-icon="'mdi-magnify'"
              :placeholder="singleAppointment.patient ? '' : 'Patient suchen'"
            >
              <template v-slot:append>
                <v-btn icon @click="openCreatePatientDialog">+</v-btn>
              </template>
            </v-text-field>
            <v-text-field
              v-model="singleAppointment.comment"
              label="Kommentar"
            ></v-text-field>

            <v-row>
              <v-col>
                <v-text-field
                  v-model="startTimeDisplay"
                  label="Startzeit"
                  readonly
                >
                  <template v-slot:append>
                    <v-btn icon @click="openDatePicker('startTime')">
                      <v-icon>mdi-calendar</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
                <VueDatePicker
                  v-model="singleAppointment.startTime"
                  time-picker
                  text-input
                  :format="formatTime"
                  @change="handleStartTimeChange"
                  :format-locale="de"
                  :ref="startDatePickerRef"
                  v-if="showStartDatePicker"
                />
              </v-col>
              <v-col>
                <v-text-field
                  v-model="endTimeDisplay"
                  label="Endzeit"
                  readonly
                >
                  <template v-slot:append>
                    <v-btn icon @click="openDatePicker('endTime')">
                      <v-icon>mdi-calendar</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
                <VueDatePicker
                  v-model="singleAppointment.endTime"
                  time-picker
                  text-input
                  :format="formatTime"
                  @change="handleEndTimeChange"
                  :format-locale="de"
                  :ref="endDatePickerRef"
                  v-if="showEndDatePicker"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-btn
                  :disabled="!isValid"
                  color="primary"
                  @click="saveSingleAppointment"
                >
                  Speichern
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!-- Serientermin Felder -->
        <div v-if="isSeries">
          <v-form>
            <v-text-field
              v-model="seriesAppointment.startDate"
              label="Von Datum"
              readonly
            >
              <template v-slot:append>
                <v-btn icon @click="openDatePicker('seriesStartDate')">
                  <v-icon>mdi-calendar</v-icon>
                </v-btn>
              </template>
            </v-text-field>
            <VueDatePicker
              v-model="seriesAppointment.startDate"
              :format="formatDate"
              :format-locale="de"
              v-if="showSeriesStartDatePicker"
            />
            
            <v-text-field
              v-model="seriesAppointment.endDate"
              label="Bis Datum"
              readonly
            >
              <template v-slot:append>
                <v-btn icon @click="openDatePicker('seriesEndDate')">
                  <v-icon>mdi-calendar</v-icon>
                </v-btn>
              </template>
            </v-text-field>
            <VueDatePicker
              v-model="seriesAppointment.endDate"
              :format="formatDate"
              :format-locale="de"
              v-if="showSeriesEndDatePicker"
            />

            <v-text-field
              v-model="seriesAppointment.weeklyFrequency"
              label="Intervall (Woche)"
              type="number"
            />
            
            <v-btn
              :disabled="!isSeriesValid"
              color="primary"
              @click="saveSeriesAppointment"
            >
              Speichern
            </v-btn>
          </v-form>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn color="grey" @click="closeAppointmentCreateDialog">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Dialog zum Erstellen eines neuen Patienten -->
    <CreatePatient
      v-model="createPatientDialogOpen"
      @save="addPatient"
    />
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick } from 'vue';
import SingleAppointment from '@/class/SingleAppointment';
import Appointment from '@/class/Appointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import { usePatientStore } from '@/store/PatientStore';
import { Weekday } from '@/class/Enums';
import CreatePatient from './CreatePatient.vue';
import AppointmentSeriesDialog from './AppointmentSeriesDialog.vue';
import { de } from 'date-fns/locale';

export default defineComponent({
  components: {
    CreatePatient,
    AppointmentSeriesDialog
  },
  props: {
    currentDay: {
      type: Date,
      required: true,
    },
    appointment: {
      type: Object as () => Appointment,
      required: true,
    },
  },
  setup(props, { emit }) {
    const dialogIsOpen = ref(false);
    const isSeries = ref(false);
    const isValid = computed(() => 
      singleAppointment.value.patient &&
      singleAppointment.value.startTime &&
      singleAppointment.value.endTime
    );
    const isSeriesValid = computed(() => 
      seriesAppointment.value.startDate &&
      seriesAppointment.value.endDate &&
      seriesAppointment.value.weeklyFrequency
    );
    const patientSearchDialogOpen = ref(false);
    const createPatientDialogOpen = ref(false);
    const showStartDatePicker = ref(false);
    const showEndDatePicker = ref(false);
    const showSeriesStartDatePicker = ref(false);
    const showSeriesEndDatePicker = ref(false);
    const startDatePickerRef = ref(null);
    const endDatePickerRef = ref(null);
    const seriesStartDatePickerRef = ref(null);
    const seriesEndDatePickerRef = ref(null);

    // Variables for formatted text fields
    const startTimeDisplay = computed({
      get: () => formatTime(singleAppointment.value.startTime),
      set: (val: string) => singleAppointment.value.startTime = parseTime(val)
    });

    const endTimeDisplay = computed({
      get: () => formatTime(singleAppointment.value.endTime),
      set: (val: string) => singleAppointment.value.endTime = parseTime(val)
    });

    const seriesStartDateDisplay = computed({
      get: () => formatDate(seriesAppointment.value.startDate),
      set: (val: string) => seriesAppointment.value.startDate = parseDate(val)
    });

    const seriesEndDateDisplay = computed({
      get: () => formatDate(seriesAppointment.value.endDate),
      set: (val: string) => seriesAppointment.value.endDate = parseDate(val)
    });

    const patientStore = usePatientStore(); // Angenommene Store Hook

    // Initialisiere das Einzelappointment
    const singleAppointment = ref<SingleAppointment>(new SingleAppointment(
      props.appointment.id,
      props.appointment.therapist,
      props.appointment.therapistId,
      props.appointment.patient,
      props.appointment.patientId,
      props.appointment.startTime,
      props.appointment.endTime,
      props.appointment.comment,
      new Date(),
      false,
      false,
      false
    ));

    const seriesAppointment = ref<AppointmentSeries>(new AppointmentSeries(
      props.appointment.id,
      props.appointment.therapist,
      props.appointment.therapistId,
      props.appointment.patient,
      props.appointment.patientId,
      props.appointment.startTime,
      props.appointment.endTime,
      new Date(),
      new Date(),
      props.appointment.comment,
      false,
      false,
      false,
      Weekday.MONDAY,
      1, // Standardwert für weeklyFrequency
      [],
      [],
      false
    ));

    // Beobachte Änderungen am Appointment-Objekt
    watch(() => props.appointment, (newAppointment) => {
      singleAppointment.value = new SingleAppointment(
        newAppointment.id,
        newAppointment.therapist,
        newAppointment.therapistId,
        newAppointment.patient,
        newAppointment.patientId,
        newAppointment.startTime,
        newAppointment.endTime,
        newAppointment.comment,
        new Date(),
        false,
        false,
        false
      );

      seriesAppointment.value = new AppointmentSeries(
        newAppointment.id,
        newAppointment.therapist,
        newAppointment.therapistId,
        newAppointment.patient,
        newAppointment.patientId,
        newAppointment.startTime,
        newAppointment.endTime,
        new Date(),
        new Date(),
        newAppointment.comment,
        false,
        false,
        false,
        Weekday.MONDAY,
        1, // Standardwert für weeklyFrequency
        [],
        [],
        false
      );
    }, { immediate: true, deep: true });

    const saveSingleAppointment = () => {
      emit('saveSingle', singleAppointment.value);
      dialogIsOpen.value = false;
    };

    const saveSeriesAppointment = () => {
      emit('saveSeries', seriesAppointment.value);
      dialogIsOpen.value = false;
    };

    const showPatientSearchDialog = () => {
      patientSearchDialogOpen.value = true;
    };

    const openCreatePatientDialog = () => {
      createPatientDialogOpen.value = true;
    };

    const closeAppointmentCreateDialog = () => {
      dialogIsOpen.value = false;
    };

    const selectPatient = (patient: any) => {
      singleAppointment.value.patient = patient.name;
      singleAppointment.value.patientId = patient.id;
      patientSearchDialogOpen.value = false;
    };

    const addPatient = (patient: any) => {
      singleAppointment.value.patient = patient.name;
      singleAppointment.value.patientId = patient.id;
      createPatientDialogOpen.value = false;
    };

    const handleStartTimeChange = (date: Date) => {
      singleAppointment.value.startTime = date;
    };

    const handleEndTimeChange = (date: Date) => {
      singleAppointment.value.endTime = date;
    };

    const formatTime = (date: Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    const openDatePicker = (type: string) => {
      if (type === 'startTime') {
        showStartDatePicker.value = true;
      } else if (type === 'endTime') {
        showEndDatePicker.value = true;
      } else if (type === 'seriesStartDate') {
        showSeriesStartDatePicker.value = true;
      } else if (type === 'seriesEndDate') {
        showSeriesEndDatePicker.value = true;
      }
    };

    const parseTime = (timeString: string): Date => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const now = new Date();
      now.setHours(hours, minutes, 0, 0);
      return now;
    };

    const parseDate = (dateString: string): Date => {
      const [day, month, year] = dateString.split('.').map(Number);
      return new Date(year, month - 1, day);
    };

    return {
      dialogIsOpen,
      isSeries,
      singleAppointment,
      seriesAppointment,
      patientSearchDialogOpen,
      createPatientDialogOpen,
      startTimeDisplay,
      endTimeDisplay,
      seriesStartDateDisplay,
      seriesEndDateDisplay,
      showPatientSearchDialog,
      openCreatePatientDialog,
      closeAppointmentCreateDialog,
      selectPatient,
      addPatient,
      saveSingleAppointment,
      saveSeriesAppointment,
      isValid,
      isSeriesValid,
      handleStartTimeChange,
      handleEndTimeChange,
      formatTime,
      formatDate,
      showStartDatePicker,
      showEndDatePicker,
      showSeriesStartDatePicker,
      showSeriesEndDatePicker,
      openDatePicker,
      startDatePickerRef,
      endDatePickerRef,
      seriesStartDatePickerRef,
      seriesEndDatePickerRef,
      de,
    };
  },
});
</script>
