<template>
    <v-card>
      <v-card-title>
        Konfliktübersicht
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
  
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="conflicts"
          class="elevation-1"
          :items-per-page="10"
          :loading="loading"
          :loading-text="'Lade Konflikte...'"
        >
        <template v-slot:item="{ item }">
        <tr @click="navigateTargetDate(item.date)" style="cursor: pointer;">
                <td> {{ formatDate(item.date) }}</td>
                <td>{{ item.therapist.firstName }} {{ item.therapist.lastName }}</td>
                <td>{{ formatTime(item.startTime) }}</td>
                <td>{{ formatTime(item.endTime) }}</td>
                <td>{{ item.comment }}</td>
              </tr>
        </template>
        </v-data-table>
      </v-card-text>
  
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" @click="closeDialog">Abbrechen</v-btn>
      </v-card-actions>
    </v-card>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import { formatDate, formatTime } from '@/class/Dateconversions';
  import { useAppointmentStore } from '@/store/AppointmentStore';
  import SingleAppointment from '@/class/SingleAppointment';
import EventBus from '@/class/EventBus';
  
  export default defineComponent({
    emits: ['dialogClosed'],
    setup(props, { emit }) {
      const loading = ref(true);
      const conflicts = ref<SingleAppointment[]>([]);
      const appointmentStore = useAppointmentStore();
  
      const headers = ref([
        { title: 'Datum', value: 'date' },
        { title: 'Therapeut', value: 'therapist' },
        { title: 'Startzeit', value: 'startTime' },
        { title: 'Endzeit', value: 'endTime' },
      ]);
  
      const loadConflicts = async () => {
        try {
          loading.value = true;
          await appointmentStore.loadAppointmentConflicts();
          conflicts.value = appointmentStore.getAppointmentConflicts;
          loading.value = false;
        } catch (error) {
          console.error('Fehler beim Laden der Konflikte:', error);
        }
      };
      
      const navigateTargetDate = (newDate: Date) => {
      EventBus.set('currentDayChanged1', newDate);
      //closeDialog();
    };
  
      const closeDialog = () => {
        emit('dialogClosed');
      };
  
      onMounted(() => {
        loadConflicts();
      });
  
      return {
        headers,
        conflicts,
        loading,
        navigateTargetDate,
        closeDialog,
        formatDate,
        formatTime,
      };
    },
  });
  </script>
  