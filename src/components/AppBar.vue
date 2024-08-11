<template>
  <v-app-bar app color="#2a2f79" dark>
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
      @click:prepend="search()"
      @keydown.enter="search()"
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
        <v-btn color="primary" @click="closeSearchResults()">Schließen</v-btn>
      </v-card-actions>
    </v-card>
    <Menu />
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Menu from '@/components/Menu.vue';
import { getModule } from 'vuex-module-decorators';
import Dateconversions from '@/class/Dateconversions';
import AppointmentStore from '../store/AppointmentStore';
import EventBus from '../class/EventBus';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';

@Component({
  components: {
    Menu,
    EventBus,
  },
})

export default class AppBar extends Vue {
  public searchTextfield = '';

  public showSearchResults = false;

  public searchResults: Array<SingleAppointment | AppointmentSeries> = [];

  public appointmentStore = getModule(AppointmentStore);

  search(): void {
    this.searchResults = [];
    if (this.searchTextfield.length > 2) {
      const searchText = this.searchTextfield.toLowerCase();

      // Suchen in Einzelterminen
      const singleAppointments = this.appointmentStore.getAllAppointments.filter(appointment =>
        appointment.patient?.lastName.toLowerCase().includes(searchText)
      );

      // Suchen in Serienterminen
      const seriesAppointments = this.appointmentStore.getAllAppointments.filter(appointment =>
      appointment.patient?.firstName.toLowerCase().includes(searchText)
      );

      this.searchResults = [...singleAppointments, ...seriesAppointments];
      this.searchResults.sort((a, b) => {
        const dateA = a instanceof AppointmentSeries ? (a as AppointmentSeries).startDate : (a as SingleAppointment).date;
        const dateB = b instanceof AppointmentSeries ? (b as AppointmentSeries).startDate : (b as SingleAppointment).date;
        return dateA.getTime() - dateB.getTime();
      });

      this.showSearchResults = true;
    }
  }

  closeSearchResults(): void {
    this.searchResults = [];
    this.searchTextfield = '';
    this.showSearchResults = false;
  }

  navigateTargetDate(date: Date): void {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateFormatted = `${day}.${month}.${year}`;

    if (year >= 2000) {
      EventBus.$emit('currentDayChanged1', dateFormatted);
    }
    this.showSearchResults = false;
  }

  getReadableDate(date: Date): string {
    return Dateconversions.convertDateToReadableString(date);
  }
}
</script>

<style>
.search-results {
  position: absolute;
  top: 100px;
  right: 400px;
  min-width: 400px;
}
</style>
