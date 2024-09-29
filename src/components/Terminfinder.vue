<template>
  <v-dialog v-model="dialogIsOpen" max-width="1500">
  <!-- Dein Stepper und sonstiger Inhalt hier -->

  <v-stepper v-model="currentStep" show-actions>
    <v-stepper-header>
      <v-stepper-item title="Therapeut & Patient auswählen" :value="1" complete editable></v-stepper-item>
      <v-divider></v-divider>
      <v-stepper-item title="Tageszeiten & Termindauer" :value="2" complete editable></v-stepper-item>
      <v-divider></v-divider>
      <v-stepper-item title="Verfügbare Slots" :value="3" complete editable></v-stepper-item>
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>

    </v-stepper-header>

    <v-stepper-window>
      <!-- Schritt 1: Therapeut & Patient auswählen -->
      <v-stepper-window-item :value="1">
        <v-select
          v-model="selectedTherapistId"
          :items="therapistsOptions"
          item-title="fullName"
          item-value="id"
          label="Therapeut"
          placeholder="Therapeut auswählen oder leer lassen"
          clearable
        ></v-select>

        <v-autocomplete
          v-model="selectedPatientId"
          :items="patientsOptions"
          item-title="fullName"
          item-value="id"
          label="Patient"
          :placeholder="'Patient auswählen'"
          @update:search-input="handleSearchInput"
          clearable
        ></v-autocomplete>
      </v-stepper-window-item>

      <!-- Schritt 2: Tageszeiten & Termindauer -->
      <v-stepper-window-item :value="2">
        <v-select
          v-model="selectedTimeOfDay"
          :items="timeOfDayOptions"
          item-title="text"
          item-value="id"
          label="Tageszeiten auswählen oder leer lassen"
          clearable
        ></v-select>

        <v-select
          v-model="selectedDuration"
          :items="availableAppointmentDurations"
          label="Termindauer auswählen"
        ></v-select>
      </v-stepper-window-item>

      <!-- Schritt 3: Verfügbare Slots anzeigen -->
      <v-stepper-window-item :value="3">
        <v-data-table
          :headers="headers"
          :items="availableSlots"
          :items-per-page="10"
          class="elevation-1"
          :loading="loading"
          loading-text="Termine werden geladen..."
          no-data-text="Keine verfügbaren Termine"
        >
        <template v-slot:item="{ item }">
              <tr @click="showAppointmentDialog(item)" style="cursor: pointer;">
                <td>{{ item.therapist.firstName }}</td>
                <td>{{ formatDate(item.date) }}</td>
                <td>{{ formatTime(item.startTime) }}</td>
                <td>{{ formatTime(item.endTime) }}</td>
                <td>{{ item.comment }}</td>
              </tr>
            </template>
      </v-data-table>
      </v-stepper-window-item>
    </v-stepper-window>

    <v-stepper-actions prev-text="Zurück" next-text="Weiter" @click:next="nextStep" @click:prev="prevStep">
    </v-stepper-actions>
  </v-stepper>
  <v-dialog v-model="appointmentDialogOpen" max-width="800px">
    <SingleAppointmentDialog
          v-if="selectedAppointment"
          :appointment.sync="selectedAppointment"
          :currentDay="new Date()"
          v-model="appointmentDialogOpen"
          @saveSingle="changeSingleAppointment"
          @cancel="appointmentDialogOpen = false"
        />
  </v-dialog>
</v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useTherapistStore } from '@/store/TherapistStore';
import { usePatientStore } from '@/store/PatientStore';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useAbsenceStore } from '@/store/AbsenceStore';
import SingleAppointment from '@/class/SingleAppointment';
import { formatDate, formatTime } from '@/class/Dateconversions';
import SingleAppointmentDialog from './SingleAppointmentDialog.vue';

export default defineComponent({
  components: {
    SingleAppointmentDialog
  },
  setup() {
    const dialogIsOpen = ref(true);
    const currentStep = ref(0);
    const selectedTherapistId = ref<number | null>(null);
    const selectedPatientId = ref<number | null>(null);
    const searchValue = ref('');
    const selectedTimeOfDay = ref<number | null>(null);
    const selectedDuration = ref<number | null>(null);
    const availableSlots = ref<SingleAppointment[]>([]);
    const appointmentDialogOpen = ref(false);
    const selectedAppointment = ref<SingleAppointment | null>(null);;
    const loading = ref(false);

    const headers = ref([
      { title: 'Therapeut', value: 'therapist.firstName', sortable: true  },
      { title: 'Datum', value: 'date', formatter: formatDate, sortable: true  },
      { title: 'Startzeit', value: 'startTime', formatter: formatTime },
      { title: 'Endzeit', value: 'endTime', formatter: formatTime },
    ]);

    const timeOfDayOptions = ref([
      { id: 1, text: 'Morgen (07:00-10:00)' },
      { id: 2, text: 'Vormittag (10:00-12:00)' },
      { id: 3, text: 'Mittag (12:00-15:00)' },
      { id: 4, text: 'Nachmittag (15:00-18:00)' },
      { id: 5, text: 'Abend (18:00-20:00)' },
      { id: 6, text: 'Ganzer Tag (07:00-20:00)' }
    ]);

    const therapistsOptions = ref<{ id: number; fullName: string }[]>([]);
    const patientsOptions = ref<{ id: number; fullName: string }[]>([]);

    const availableAppointmentDurations = [10, 20, 30, 40, 50, 60];

    const therapistStore = useTherapistStore();
    const patientStore = usePatientStore();
    const appointmentStore = useAppointmentStore();

    const foundPatients = ref(patientStore.patients);

    onMounted(async () => {
      await therapistStore.loadTherapists();
      therapistsOptions.value = therapistStore.getAllTherapists.map((t) => ({
        id: t.id,
        fullName: t.fullName,
      }));

      await patientStore.loadPatients();
      patientsOptions.value = patientStore.patients.map((p) => ({
        id: p.id,
        fullName: p.fullName,
      }));
    });

    watch(searchValue, async (val) => {
      if (val.length > 2) {
        foundPatients.value = await patientStore.findPatientsByName(val);
      }
    });

    watch(currentStep, async (newStep) => {
      if (newStep === 3) {
        await findAvailableSlots();
      }
    });

    function showAppointmentDialog(item: SingleAppointment) {
      selectedAppointment.value = item;
      appointmentDialogOpen.value = true;
    }

    const handleSearchInput = async (val: string) => {
      searchValue.value = val;
    };

    const nextStep = () => {
      if (currentStep.value < 3) currentStep.value++;
    };

    const prevStep = () => {
      if (currentStep.value > 1) currentStep.value--;
    };

    const findAvailableSlots = async () => {
      try {
        loading.value = true;
        const queryParams = {
          therapistId: selectedTherapistId.value,
          patientId: selectedPatientId.value,
          timeOfDayId: selectedTimeOfDay.value,
          duration: selectedDuration.value
        };
        nextStep(); 
        const availableAppointments = await appointmentStore.findAvailableAppointments(queryParams);
        availableSlots.value = availableAppointments;
        loading.value = false;
      } catch (error) {
        console.error('Error finding available slots:', error);
        loading.value = false;
      }
    };

    const changeSingleAppointment = async (appointment: SingleAppointment) => {
       await appointmentStore.addAppointment(appointment);
    };

    const closeDialog = () => {
      dialogIsOpen.value = false;
    };


    const resetWizard = () => {
      currentStep.value = 1;
      selectedTherapistId.value = null;
      selectedPatientId.value = null;
      selectedTimeOfDay.value = null;
      selectedDuration.value = null;
      availableSlots.value = [];
    };

    return {
      currentStep,
      selectedTherapistId,
      selectedPatientId,
      searchValue,
      selectedTimeOfDay,
      selectedDuration,
      availableSlots,
      therapistsOptions,
      headers,
      patientsOptions,
      timeOfDayOptions,
      availableAppointmentDurations,
      dialogIsOpen,
      appointmentDialogOpen,
      selectedAppointment,
      loading,
      showAppointmentDialog,
      nextStep,
      prevStep,
      findAvailableSlots,
      changeSingleAppointment,
      handleSearchInput,
      formatDate,
      formatTime,
      closeDialog,
    };
  },
});
</script>
