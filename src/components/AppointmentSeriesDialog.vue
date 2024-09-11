<template>
  <v-dialog persistent v-model="dialogIsOpen" width="800">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Serientermin - {{ appointment.therapist.firstName }} - {{ appointment.weekday }}s
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form>
        <!-- Patientensuche -->
        <v-autocomplete
          v-model="selectedPatientId"
          :items="patientsOptions"
          item-title="name"
          item-value="id"
          label="Patient suchen"
          :placeholder="appointment.patient.fullName || 'Patient suchen'"
          @update:search-input="handleSearchInput"
        >
          <template v-slot:item="data">
            <v-list-item v-bind="data.props">
            </v-list-item>
          </template>
        </v-autocomplete>

        <!-- Zeitpicker für Einzeltermin -->
        <v-row>
          <v-col>
            <div class="v-label">Von</div>
            <VueDatePicker
              v-model="appointment.startTime"
              :format-locale="de"
              :format="formatTime"
              minutes-increment="10"
              teleport-center
              select-text="Bestätigen"
              cancel-text="Abbrechen"
            />
          </v-col>
          <v-col>
            <div class="v-label">Bis</div>
            <VueDatePicker
              v-model="appointment.endTime"
              :format-locale="de"
              :format="formatTime"
              minutes-increment="10"
              teleport-center
              select-text="Bestätigen"
              cancel-text="Abbrechen"
            />
          </v-col>
        </v-row>

            <v-row>
              <v-col>
                <div class="v-label">Datum Von</div>
                <VueDatePicker
                  v-model="appointment.startDate"
                  :format-locale="de"
                  :format="formatDate"
                  :enable-time-picker="false"
                  teleport-center
                  select-text="Bestätigen"
                  cancel-text="Abbrechen"
                />
              </v-col>
              <v-col>
                <div class="v-label">Datum Bis</div>
                <VueDatePicker
                  v-model="appointment.endDate"
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
              v-model="appointment.weeklyFrequency"
              label="Intervall (Woche)"
              type="number"
            />
             <!-- Kommentar -->
        <v-text-field
          v-model="appointment.comment"
          label="Kommentar"
        ></v-text-field>
      </v-form>
    </v-card-text>
      <v-card-actions>
        <v-btn color="normal" @click="closeDialog">Abbrechen</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="deleteAppointment">Serien Termin Löschen</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="saveAppointment">Speichern</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import AppointmentSeries from '@/class/AppointmentSeries';
import { formatDate, formatTime, getAllTimes } from '@/class/Dateconversions';
import { de } from 'date-fns/locale';
import Patient from '@/class/Patient';
import { usePatientStore } from '@/store/PatientStore';

export default defineComponent({
  props: {
    appointment: {
      type: AppointmentSeries,
      required: true,
    },
    currentDay: {
      type: Date,
      required: true,
    },
  },
  emits: ['saveSeries', 'deleteSeries', 'cancel'],
  setup(props, { emit }) {
    const dialogIsOpen = ref(false);
    const searchValue = ref('');
    const appointmentSeries = ref<AppointmentSeries>(props.appointment);
    const patientStore = usePatientStore();
    const patients = ref<Patient[]>([]);
    const patientsOptions = ref<{ id: number, name: string }[]>([]);
    const times = ref(getAllTimes());
    const selectedPatientId = ref<number | null>(props.appointment.patient?.id || null);

    const isValid = computed(() =>
    appointmentSeries.value.patient &&
    appointmentSeries.value.startTime &&
    appointmentSeries.value.endTime
  );

  const isSeriesValid = computed(() =>
  appointmentSeries.value.startDate &&
  appointmentSeries.value.endDate &&
  appointmentSeries.value.weeklyFrequency
  );
      
  onMounted(() => {
    loadPatients();
  });

  watch(() => props.appointment, (newAppointment) => {
      appointmentSeries.value = newAppointment;
      selectedPatientId.value = newAppointment.patient?.id || null;
    });

  watch(() => patientStore.getAllPatients, (newPatients) => {
    patients.value = newPatients;
    patientsOptions.value = newPatients.map(patient => ({
      id: patient.id,
      name: patient.firstName + ' ' + patient.lastName
    }));
  });

  watch(selectedPatientId, (newId) => {
    if (newId) {
      const patient = patients.value.find(p => p.id === newId);
      if (patient) {
        appointmentSeries.value.patient = patient;
        appointmentSeries.value.patientId = patient.id;
      }
    }
  });

  const loadPatients = async () => {
    await patientStore.loadPatients();
    patients.value = patientStore.getAllPatients;
  };

  const handleSearchInput = (search: string) => {
    // Optionale Filterlogik basierend auf der Suchanfrage
  };

    const saveAppointment = () => {
      emit('saveSeries');
      closeDialog();
    };

    const deleteAppointment = () => {
      emit('deleteSeries');
      closeDialog();
    };

    const closeDialog = () => {
      emit('cancel');
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

    return {
      dialogIsOpen,
      searchValue,
      times,
      patients,
      selectedPatientId,
      patientsOptions,
      de,
      handleSearchInput,
      saveAppointment,
      deleteAppointment,
      closeDialog,
      formatTime,
      formatDate,
    };
  },
});
</script>
