<template>
  <v-app-bar color="#2a2f79" dark>
    <img src="@/assets/icon-inverted.png" height="50px" class="mr-4" />
    <div class="d-flex align-center">
      <h1 class="text-h4">Physiokalender - Praxis Meyer</h1>
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
    <v-card
      v-if="showSearchResults"
      class="search-results"
      light
      elevation="24"
    >
      <v-card-title>Suchergebnisse</v-card-title>
      <ul class="pt-2 ml-4 mr-4 mb-4" v-if="searchResults.length > 0">
        <li v-for="(result, i) in searchResults" :key="`${result.id}-${i}`">
          <!-- <v-btn text @click="navigateTargetDate(result.date)">
            <strong>{{ result.patient }}:</strong>
            {{
              // result.startDate ? `${result.weekday}s` : getReadableDate(result.date)
            }}, {{ result.startTime }} bis {{ result.endTime }} bei
            {{ result.therapist }}
          </v-btn> -->
        </li>
      </ul>
      <p v-else>Keine Termine gefunden.</p>
      <v-card-actions>
        <v-btn color="primary" @click="closeSearchResults">Schließen</v-btn>
      </v-card-actions>
    </v-card>
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
    const showSearchResults = ref(false);
    const searchResults = ref<Array<SingleAppointment | AppointmentSeries>>([]);

    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();

    const search = () => {
      // searchResults.value = [];
      // if (searchTextfield.value.length > 2) {
      //   const searchText = searchTextfield.value.toLowerCase();

      //   const singleAppointments: SingleAppointment[] = appointmentStore.getAllAppointments.filter(
      //     (appointment: SingleAppointment) => appointment.patient?.lastName.toLowerCase().includes(searchText)
      //   );

      //   const seriesAppointments: AppointmentSeries[] = appointmentSeriesStore.getAllAppointmentSeriess.filter(
      //     (appointment: AppointmentSeries) => appointment.patient?.firstName.toLowerCase().includes(searchText)
      //   );

      //   searchResults.value = [...singleAppointments, ...seriesAppointments];
      //   searchResults.value.sort((a, b) => {
      //     const dateA = a instanceof AppointmentSeries ? a.startDate : a.date;
      //     const dateB = b instanceof AppointmentSeries ? b.startDate : b.date;
      //     return dateA.getTime() - dateB.getTime();
      //   });

      //   showSearchResults.value = true;
      // }
    };

    const closeSearchResults = () => {
      searchResults.value = [];
      searchTextfield.value = '';
      showSearchResults.value = false;
    };

    const navigateTargetDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dateFormatted = `${day}.${month}.${year}`;

      if (year >= 2000) {
        EventBus.set('currentDayChanged', date);
      }
      showSearchResults.value = false;
    };

    const getReadableDate = (date: Date) => {
      return Dateconversions.convertDateToReadableString(date);
    };

    return {
      searchTextfield,
      showSearchResults,
      searchResults,
      search,
      closeSearchResults,
      navigateTargetDate,
      getReadableDate,
    };
  },
});
</script>

<style scoped>
.search-results {
  position: absolute;
  top: 100px;
  right: 400px;
  min-width: 400px;
}
</style>
