<template>
  <v-dialog persistent v-model="dialogIsOpen" width="800">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        <v-row>
          <v-col>
            Neuen Termin erstellen - {{ appointment.therapist.firstName }}
          </v-col>
          <v-col cols="auto">
            <v-switch v-model="isSeries" label="Serientermin"></v-switch>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Einzeltermin Felder -->
        <v-form>
          <v-autocomplete
            v-model="selectedPatientId"
            :items="patientsOptions"
            item-title="name"
            item-value="id"
            label="Patient suchen"
            :placeholder="singleAppointment.patient?.fullName || 'Patient suchen'"
            @update:search-input="handleSearchInput"
          >
            <template v-slot:item="data">
              <v-list-item v-bind="data.props">
              </v-list-item>
            </template>
            <template v-slot:append>
              <v-btn icon @click="openCreatePatientDialog">+</v-btn>
            </template>
          </v-autocomplete>

          <v-row>
            <v-col>
              <VueDatePicker
                v-model="singleAppointment.startTime"
                :format-locale="de"
                :format="formatTime"
                minutes-increment="10"
                teleport-center
                select-text="Bestätigen"
                cancel-text="Abbrechen"
              />
            </v-col>
            <v-col>
              <VueDatePicker
                v-model="singleAppointment.endTime"
                :format-locale="de"
                :format="formatTime"
                minutes-increment="10"
                teleport-center
                select-text="Bestätigen"
                cancel-text="Abbrechen"
              />
            </v-col>
          </v-row>
          <v-row v-if="!isSeries">
            <v-col>
              <v-checkbox
                v-model="singleAppointment.isHotair"
                label="Heißluft"
              ></v-checkbox>
            </v-col>
            <v-col>
              <v-checkbox
                v-model="singleAppointment.isElectric"
                label="Elektro"
              ></v-checkbox>
            </v-col>
            <v-col>
              <v-checkbox
                v-model="singleAppointment.isUltrasonic"
                label="Ultraschall"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-form>

        <!-- Serientermin Felder -->
        <div v-if="isSeries">
          <v-form>
            <v-row>
            <v-col>
              <VueDatePicker
                v-model="seriesAppointment.startDate"
                :format-locale="de"
                :format="formatDate"
                :enable-time-picker="false"
                teleport-center
                select-text="Bestätigen"
                cancel-text="Abbrechen"
              />
            </v-col>
            <v-col>
              <VueDatePicker
                v-model="seriesAppointment.endDate"
                :format-locale="de"
                :format="formatDate"
                :enable-time-picker="false"
                teleport-center
                select-text="Bestätigen"
                cancel-text="Abbrechen"
              />
            </v-col>
          </v-row>

            <v-text-field
              v-model="seriesAppointment.weeklyFrequency"
              label="Intervall (Woche)"
              type="number"
            />
          </v-form>
        </div>

        <v-text-field
          v-model="singleAppointment.comment"
          label="Kommentar"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn color="grey" @click="closeAppointmentCreateDialog">Abbrechen</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!isSeries ? !isValid : !isSeriesValid"
          color="primary"
          @click="saveAppointment"
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="createPatientDialogOpen" max-width="1500">
      <v-card>
        <CreatePatient 
          @save="addPatient" 
          @cancel="createPatientDialogOpen = false" 
        />
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, onMounted } from 'vue';
import Appointment from '@/class/Appointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import { usePatientStore } from '@/store/PatientStore';
import { Weekday } from '@/class/Enums';
import CreatePatient from './CreatePatient.vue';
import { de } from 'date-fns/locale';
import SingleAppointment from '@/class/SingleAppointment';
import Patient from '@/class/Patient';

export default defineComponent({
  components: {
    CreatePatient
  },
  props: {
    currentDay: {
      type: Date,
      required: true,
    },
    appointment: {
      type: Object as () => SingleAppointment,
      required: true,
    },
  },
  setup(props, { emit }) {
    const dialogIsOpen = ref(false);
    const isSeries = ref(false);
    const patientSearchDialogOpen = ref(false);
    const createPatientDialogOpen = ref(false);
    const showStartDatePicker = ref(false);
    const showEndDatePicker = ref(false);
    const showSeriesStartDatePicker = ref(false);
    const showSeriesEndDatePicker = ref(false);

    const selectedDate = ref(new Date(props.appointment.startTime));
    const selectedTime = ref(new Date(props.appointment.startTime));

    const patientStore = usePatientStore(); // Angenommene Store Hook
    const patients = ref<Patient[]>([]);
      const patientsOptions = ref<{ id: number, name: string }[]>([]);

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
      props.appointment.createdBySeriesAppointment,
      props.appointment.appointmentSeriesId,
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
      Weekday.MONDAY,
      1, // Standardwert für weeklyFrequency
      [],
      []
    ));

    onMounted(() => {
      loadPatients();
      console.log(singleAppointment);
    });

    watch(() => patientStore.getAllPatients, (newPatients) => {
      patients.value = newPatients;
      // Update patientsOptions when patients change
      patientsOptions.value = newPatients.map(patient => ({
        id: patient.id,
        name: patient.firstName + ' ' + patient.lastName
      }));
    });

    const loadPatients = async () => {
      // loading.value = true;
      await patientStore.loadPatients();
      //loading.value = false;
      patients.value = patientStore.getAllPatients;
    };

    const selectedPatientId = ref<number | null>(singleAppointment.value.patient?.id || null);

    watch(selectedPatientId, (newId) => {
      if (newId) {
        const patient = patients.value.find(p => p.id === newId);
        if (patient) {
          singleAppointment.value.patient = patient;
          singleAppointment.value.patientId = patient.id;
        }
      }
    });

    const handleSearchInput = (search: string) => {
      // Optionale Filterlogik basierend auf der Suchanfrage
    };

    const updateStartTime = () => {
      singleAppointment.value.startTime = singleAppointment.value.startTime;
    };

    const updateEndTime = () => {
      singleAppointment.value.endTime = singleAppointment.value.endTime;
    };

    // Computed properties for formatted text fields
    const startTimeDisplay = computed({
      get: () => formatTime(singleAppointment.value.startTime),
      set: (val: string) => {
        const parsedTime = parseTime(val);
        if (!isNaN(parsedTime.getTime())) {
          singleAppointment.value.startTime = parsedTime;
        }
      }
    });

    const endTimeDisplay = computed({
      get: () => formatTime(singleAppointment.value.endTime),
      set: (val: string) => {
        const parsedTime = parseTime(val);
        if (!isNaN(parsedTime.getTime())) {
          singleAppointment.value.endTime = parsedTime;
        }
      }
    });

    const seriesStartDateDisplay = computed({
      get: () => formatDate(seriesAppointment.value.startDate),
      set: (val: string) => {
        const parsedDate = parseDate(val);
        if (!isNaN(parsedDate.getTime())) {
          seriesAppointment.value.startDate = parsedDate;
        }
      }
    });

    const seriesEndDateDisplay = computed({
      get: () => formatDate(seriesAppointment.value.endDate),
      set: (val: string) => {
        const parsedDate = parseDate(val);
        if (!isNaN(parsedDate.getTime())) {
          seriesAppointment.value.endDate = parsedDate;
        }
      }
    });

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

    const saveAppointment = () => {
      if (isSeries.value) {
        if (!seriesAppointment.value.startDate || !seriesAppointment.value.endDate || !seriesAppointment.value.weeklyFrequency) {
          alert('Bitte alle Felder für den Serientermin ausfüllen.');
          return;
        }
        if (!selectedPatientId) {
          alert('Bitte einen gültigen Patienten auswählen.');
          return;
        }
        saveSeriesAppointment();
      } else {
        if (!singleAppointment.value.patient || !singleAppointment.value.startTime || !singleAppointment.value.endTime) {
          alert('Bitte alle Felder für den Einzeltermin ausfüllen.');
          return;
        }
        saveSingleAppointment();
      }
    };


    const saveSingleAppointment = () => {
      emit('saveSingle', singleAppointment.value);
    };

    const saveSeriesAppointment = () => {
      // Übertrage die Werte von singleAppointment auf seriesAppointment
      seriesAppointment.value.patient = singleAppointment.value.patient;
      seriesAppointment.value.patientId = singleAppointment.value.patientId;
      seriesAppointment.value.startTime = singleAppointment.value.startTime;
      seriesAppointment.value.endTime = singleAppointment.value.endTime;
      seriesAppointment.value.comment = singleAppointment.value.comment;

      emit('saveSeries', seriesAppointment.value);
      dialogIsOpen.value = false;
    };



    const openCreatePatientDialog = () => {
      createPatientDialogOpen.value = true;
    };

    const closeAppointmentCreateDialog = () => {
      emit('cancel');
    };

    const selectPatient = (patient: Patient) => {
      singleAppointment.value.patient = patient;
      singleAppointment.value.patientId = patient.id;
      patientSearchDialogOpen.value = false;
    };

    const addPatient = (patient: Patient) => {
      singleAppointment.value.patient = patient;
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
      updateStartTime,
      updateEndTime,
      endTimeDisplay,
      seriesStartDateDisplay,
      seriesEndDateDisplay,
      openCreatePatientDialog,
      closeAppointmentCreateDialog,
      selectPatient,
      addPatient,
      formatTime,
      saveSingleAppointment,
      saveSeriesAppointment,
      saveAppointment,
      isValid,
      isSeriesValid,
      handleStartTimeChange,
      handleEndTimeChange,
      handleSearchInput,
      selectedDate,
      selectedTime,
      formatDate,
      showStartDatePicker,
      patientsOptions,
      selectedPatientId,
      showEndDatePicker,
      showSeriesStartDatePicker,
      showSeriesEndDatePicker,
      openDatePicker,
      de,
      patients,
    };
  },
});
</script>
