<template>
  <v-dialog persistent v-model="dialogIsOpen" width="600">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Neuen Termin erstellen - {{ appointment.therapist.name }}
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Switch für Serientermine -->
        <v-switch v-model="isSeries" label="Serientermin"></v-switch>

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
                <VueDatePicker
                  v-model="singleAppointment.startTime"
                  time-picker
                  text-input
                  :format="formatTime"
                  @change="handleStartTimeChange"
                  :format-locale="de"
                  :value="singleAppointment.startTime"
                />
                <v-text-field
                  v-model="singleAppointment.startTime"
                  label="Startzeit"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col>
                <VueDatePicker
                  v-model="singleAppointment.endTime"
                  time-picker
                  text-input
                  :format="formatTime"
                  @change="handleEndTimeChange"
                  :format-locale="de"
                  :value="singleAppointment.endTime"
                />
                <v-text-field
                  v-model="singleAppointment.endTime"
                  label="Endzeit"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>

            <v-btn
              :disabled="!isValid"
              color="primary"
              @click="saveSingleAppointment"
            >
              Speichern
            </v-btn>
          </v-form>
        </div>

        <!-- Serientermin Felder -->
        <div v-if="isSeries">
          <AppointmentSeriesDialog
            :appointment="seriesAppointment"
            :currentDay="currentDay"
            @save="saveSeriesAppointment"
          />
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn color="grey" @click="dialogIsOpen = false">Abbrechen</v-btn>
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
import { defineComponent, ref, computed, watch } from 'vue';
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
    const isValid = computed(() => singleAppointment.value.patient && singleAppointment.value.startTime && singleAppointment.value.endTime);
    const patientSearchDialogOpen = ref(false);
    const createPatientDialogOpen = ref(false);
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

    return {
      dialogIsOpen,
      isSeries,
      singleAppointment,
      seriesAppointment,
      patientSearchDialogOpen,
      createPatientDialogOpen,
      showPatientSearchDialog,
      openCreatePatientDialog,
      selectPatient,
      addPatient,
      saveSingleAppointment,
      saveSeriesAppointment,
      isValid,
      handleStartTimeChange,
      handleEndTimeChange,
      de,
      formatTime,
    };
  },
});
</script>