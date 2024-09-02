<template>
  <v-app-bar color="#2a2f79" dark>
    <img src="@/assets/icon-inverted.png" height="50px" class="mr-4" />
    <div class="d-flex align-center">
      <h1 class="text-h4">Physiokalender - Praxis Meyer 2.0</h1>
    </div>
    <v-spacer></v-spacer>
    <v-text-field
      hide-details
      prepend-icon="mdi-magnify"
      single-line
      v-model="searchTextfield"
      @click:prepend="search"
      @keydown.enter="search"
    ></v-text-field>
    <v-dialog
      v-model="showDialog"
      max-width="600px"
      persistent
      scrollable
    >
      <v-card>
        <v-card-title>Suchergebnisse</v-card-title>
        <v-card-text>
          <ul class="search-results-list" v-if="searchResults.length > 0">
            <li v-for="(result, i) in searchResults" :key="`${result.id}-${i}`">
              <v-btn @click="navigateTargetDate(result.startTime)" class="search-result-btn">
                <strong>{{ result.patient.fullName }}: </strong>
                {{ getReadableDate(result.startTime) }},
                {{ result.startTime.toLocaleTimeString() }} bis {{ result.endTime.toLocaleTimeString() }} bei {{ result.therapist.firstName }}
                
              </v-btn>
            </li>
          </ul>
          <p v-else>Keine Termine gefunden.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeDialog">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Menu />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Menu from '@/components/Menu.vue';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useAppointmentSeriesStore } from '@/store/AppointmentSeriesStore';
import Dateconversions from '@/class/Dateconversions';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import EventBus from '@/class/EventBus';

export default defineComponent({
  components: {
    Menu,
  },
  setup() {
    const searchTextfield = ref('');
    const showDialog = ref(false);
    const searchResults = ref<Array<SingleAppointment>>([]);

    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();

    const search = async () => {
      await appointmentStore.loadAppointments();
      
      searchResults.value = [];
      if (searchTextfield.value.length > 1) {
        const searchText = searchTextfield.value.toLowerCase();

        const singleAppointments: SingleAppointment[] = appointmentStore.getAllAppointments.filter(
          (appointment: SingleAppointment) => appointment.patient?.fullName.toLowerCase().includes(searchText)
        );  
        
        searchResults.value = [...singleAppointments];
        searchResults.value.sort((a, b) => {
          const dateA = a.startTime;
          const dateB = b.startTime;
          return dateA.getTime() - dateB.getTime();
        });
        
        showDialog.value = true; // Dialog öffnen
      }
    };

    const closeDialog = () => {
      searchResults.value = [];
      searchTextfield.value = '';
      showDialog.value = false; // Dialog schließen
    };

    const navigateTargetDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dateFormatted = `${day}.${month}.${year}`;

      if (year >= 2000) {
        EventBus.set('currentDayChanged', date);
      }
      closeDialog(); // Dialog schließen nach Auswahl
    };

    const getReadableDate = (date: Date) => {
      return Dateconversions.convertDateToReadableString(date);
    };

    return {
      searchTextfield,
      showDialog,
      searchResults,
      search,
      closeDialog,
      navigateTargetDate,
      getReadableDate,
    };
  },
});
</script>
