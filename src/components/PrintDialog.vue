<template>
      <v-card>
        <v-card-title class="text-h5">Termine drucken</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col>
                <div class="v-label">Von</div>
                <VueDatePicker
                  teleport-center
                  v-model="startDate"
                  label="Startdatum"
                  :format="formatDate"
                  :format-locale="de"
                />
              </v-col>
              <v-col>
                <div class="v-label">Bis</div>
                <VueDatePicker
                  teleport-center
                  v-model="endDate"
                  label="Enddatum"
                  :format="formatDate"
                  :format-locale="de"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" @click="cancel">Abbrechen</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="printAppointments">Drucken</v-btn>
        </v-card-actions>
      </v-card>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch, onMounted } from 'vue';
  import { formatDate } from '@/class/Dateconversions';
  import Printer from '@/class/Printer';
  import { de } from 'date-fns/locale';
import { useAppointmentStore } from '@/store/AppointmentStore';
  
  export default defineComponent({
    props: {
      patientId: {
        type: Number,
        required: true
      },
    },
    setup(props, { emit }) {
      const dialogOpen = ref(false);
      const startDate = ref(new Date());
      const endDate = ref(new Date());
      const printer = new Printer(props.patientId);
      const appointmentStore = useAppointmentStore();
  
      const fetchLastAppointmentDate = async () => {
        const appointments = appointmentStore.getAppointmentsByPatientId(props.patientId);
        if (appointments.length > 0) {
          appointments.sort((a, b) => new Date(a.date).getTime()  -new Date(b.date).getTime());
          endDate.value = appointments[appointments.length - 1].date; // Letztes Datum setzen
        }
      };
  
      const printAppointments = async () => {
        printer.printPatientAppointmentsWithinDateRange(startDate.value, new Date(endDate.value));
        console.log(endDate.value);
        emit('cancel');
      };
  
      const cancel = () => {
        dialogOpen.value = false;
        emit('cancel');
      };
  
      onMounted(() => {
          fetchLastAppointmentDate();
      });
  
      return {
        dialogOpen,
        startDate,
        endDate,
        printAppointments,
        cancel,
        formatDate,
        de,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Stildefinitionen nach Bedarf */
  </style>
  