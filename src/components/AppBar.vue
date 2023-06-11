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
      <ul class="pt-2 ml-4 mr-4 mb-4">
        <li v-for="(result, i) in searchResults" :key="`${result.id}-${i}`">
          <strong>{{ result.patient }}:</strong>
          {{
            result.startDate ? `${result.weekday}s` : getReadableDate(result.date)
          }}, {{ result.startTime }} bis {{ result.endTime }} bei
          {{ result.therapist }}
        </li>
      </ul>
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
import Appointment from '@/class/Appointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import SingleAppointment from '@/class/SingleAppointment';
import Backup from '@/class/Backup';
import Dateconversions from '@/class/Dateconversions';
import Store from '../store/backup';

@Component({
  components: {
    Menu,
  },
})

export default class AppBar extends Vue {
  private searchTextfield = '';

  private showSearchResults = false;

  private searchResults: Appointment[] = [];

  store = getModule(Store);

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  search(): void {
    this.searchResults = [];
    if (this.localBackup && this.searchTextfield.length > 2) {
      this.localBackup.masterlist.elements.forEach((listDay) => {
        this.searchResults = this.searchResults.concat(listDay.appointments.filter((appointment) => {
          const readableStartDate = Dateconversions.convertDateToReadableString((appointment as AppointmentSeries).startDate);
          const readableTargetDate = Dateconversions.convertDateToReadableString(new Date());
          return appointment.patient
            && ((appointment as AppointmentSeries).startDate < new Date() || readableStartDate === readableTargetDate)
            && appointment.patient.toLowerCase().includes(this.searchTextfield);
        }));
      });
      console.log(this.searchResults);
      this.localBackup.daylist.elements.forEach((listDay) => {
        this.searchResults = this.searchResults.concat(listDay.appointments.filter((appointment) => {
          const readableStartDate = Dateconversions.convertDateToReadableString((appointment as SingleAppointment).date);
          const readableTargetDate = Dateconversions.convertDateToReadableString(new Date());
          return appointment.patient
            && ((appointment as SingleAppointment).date > new Date() || readableStartDate === readableTargetDate)
            && appointment.patient.toLowerCase().includes(this.searchTextfield);
        }));
      });
      console.log(this.searchResults);
      this.showSearchResults = true;
    }
  }

  closeSearchResults(): void {
    this.searchResults = [];
    this.searchTextfield = '';
    this.showSearchResults = false;
  }

  // eslint-disable-next-line class-methods-use-this
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
