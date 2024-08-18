<template>
  <v-dialog persistent v-model="dialogIsOpen" width="600">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Neuen Termin erstellen - {{ appointment.therapist.name }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-switch v-model="isSeries" label="Serientermin"></v-switch>

        <SingleAppointmentDialog
          v-if="!isSeries"
          :therapist="appointment.therapist"
          :appointment="singleAppointment"
          :currentDay="currentDay"
          @save="saveSingleAppointment"
        />

        <AppointmentSeriesDialog
          v-if="isSeries"
          :therapist="appointment.therapist"
          :appointment="seriesAppointment"
          :currentDay="currentDay"
          @save="saveSeriesAppointment"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn color="normal" @click="dialogIsOpen = false">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import SingleAppointmentDialog from './SingleAppointmentDialog.vue';
import AppointmentSeriesDialog from './AppointmentSeriesDialog.vue';
import Appointment from '@/class/Appointment';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import { Weekday } from '@/class/Enums';

export default defineComponent({
  components: {
    SingleAppointmentDialog,
    AppointmentSeriesDialog,
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

    // Initialisierung von SingleAppointment und AppointmentSeries
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

    // Beobachten von Änderungen am Appointment-Objekt und Aktualisierung der spezifischen Objekte
    watch(() => props.appointment, (newAppointment) => {
      singleAppointment.value =new SingleAppointment(
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

    const saveSingleAppointment = (appointment: SingleAppointment) => {
      emit('saveSingle', appointment);
      dialogIsOpen.value = false;
    };

    const saveSeriesAppointment = (appointment: AppointmentSeries) => {
      emit('saveSeries', appointment);
      dialogIsOpen.value = false;
    };

    return {
      dialogIsOpen,
      isSeries,
      singleAppointment,
      seriesAppointment,
      saveSingleAppointment,
      saveSeriesAppointment,
    };
  },
});
</script>
