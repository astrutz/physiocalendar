<template>
  <v-stepper v-model="currentStep" show-actions>
    <v-stepper-header>
      <v-stepper-item title="Therapeut & Patient auswählen" :value="1" complete editable></v-stepper-item>
      <v-divider></v-divider>
      <v-stepper-item title="Tageszeiten & Termindauer" :value="2" complete editable></v-stepper-item>
      <v-divider></v-divider>
      <v-stepper-item title="Verfügbare Slots" :value="3" complete editable></v-stepper-item>
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
          item-value="value"
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
        <v-row>
          <v-col v-for="slot in availableSlots" :key="slot.id">
            <v-card @click="bookSlot(slot)">
              <v-card-title>{{ slot.therapist }} - {{ formatDate(slot.date) }}</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-stepper-window-item>
    </v-stepper-window>

    <v-stepper-actions prev-text="Zurück" next-text="Weiter" @click:next="nextStep" @click:prev="prevStep">
    </v-stepper-actions>
  </v-stepper>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useTherapistStore } from '@/store/TherapistStore';
import { usePatientStore } from '@/store/PatientStore';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useAbsenceStore } from '@/store/AbsenceStore';
import SingleAppointment from '@/class/SingleAppointment';
import { formatDate } from '@/class/Dateconversions';

export default defineComponent({
  setup() {
    const currentStep = ref(0);
    const selectedTherapistId = ref<number | null>(null);
    const selectedPatientId = ref<number | null>(null);
    const selectedTherapist = ref<string | null>(null);
    const selectedPatient = ref<string | null>(null);
    const searchValue = ref('');
    const selectedTimeOfDay = ref<string | null>(null);
    const selectedDuration = ref<number | null>(null);
    const availableSlots = ref<SingleAppointment[]>([]);

    const timeOfDayOptions = [
      { text: 'Morgen (07:00-10:00)', value: 'Morgen' },
      { text: 'Vormittag (10:00-12:00)', value: 'Vormittag' },
      { text: 'Mittag (12:00-15:00)', value: 'Mittag' },
      { text: 'Nachmittag (15:00-18:00)', value: 'Nachmittag' },
      { text: 'Abend (18:00-20:00)', value: 'Abend' },
    ];

    const therapistsOptions = ref<{ id: number; fullName: string }[]>([]);
    const patientsOptions = ref<{ id: number; fullName: string }[]>([]);

    const availableAppointmentDurations = [10, 20, 30, 40, 50, 60];

    const therapistStore = useTherapistStore();
    const patientStore = usePatientStore();
    const appointmentStore = useAppointmentStore();
    const absenceStore = useAbsenceStore();

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
      // Filter for available appointments by selected therapist, patient, time of day, and absence checking
      const possibleAppointments = await appointmentStore.findAvailableAppointments({
        therapist: selectedTherapist.value,
        timeOfDay: selectedTimeOfDay.value,
        duration: selectedDuration.value,
      });

      const availableAppointments = possibleAppointments.filter(
        (appointment: SingleAppointment) => !absenceStore.isTherapistAbsent(appointment.therapistId, appointment.date)
      );

      availableSlots.value = availableAppointments;
      nextStep();
    };

    const bookSlot = async (slot: SingleAppointment) => {
      // Logic to book the selected slot
      //await appointmentStore.bookAppointment(slot);
      // Optionally reset the wizard
      currentStep.value = 1;
      selectedTherapist.value = null;
      selectedPatient.value = null;
      selectedTimeOfDay.value = null;
      selectedDuration.value = null;
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
      patientsOptions,
      timeOfDayOptions,
      availableAppointmentDurations,
      nextStep,
      prevStep,
      findAvailableSlots,
      bookSlot,
      handleSearchInput,
      formatDate,
    };
  },
});
</script>
