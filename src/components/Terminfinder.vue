<template>
  <v-card>
    <v-card-title class="text-h5 grey lighten-2"> Terminfinder </v-card-title>

    <div v-if="appointmentSearchStarted === false">
      <v-card-text class="pt-5">
        <v-text-field
          label="Name des Patienten"
          v-model="patientTextfield"
          clearable
        ></v-text-field>
        <v-row class="pl-3">
          <v-select
            v-model="selectedTherapists"
            :items="therapists"
            placeholder="Therapeuten auswählen"
            clearable
            multiple
          ></v-select>
        </v-row>
        <v-row class="pl-3 mt-6">
          <h3 style="color: black">Mögliche Termine</h3>
        </v-row>
        <v-row class="pl-3">
          <v-col cols="2">
            <v-checkbox
              v-for="request in appointmentRequests.filter(
                (req, i) => i % 5 === 0
              )"
              :key="`${request.weekday}-${request.timeOfDay}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request.weekday} ${request.timeOfDay}`"
              :value="request"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="request in appointmentRequests.filter(
                (req, i) => i % 5 === 1
              )"
              :key="`${request.weekday}-${request.timeOfDay}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request.weekday} ${request.timeOfDay}`"
              :value="request"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="request in appointmentRequests.filter(
                (req, i) => i % 5 === 2
              )"
              :key="`${request.weekday}-${request.timeOfDay}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request.weekday} ${request.timeOfDay}`"
              :value="request"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="request in appointmentRequests.filter(
                (req, i) => i % 5 === 3
              )"
              :key="`${request.weekday}-${request.timeOfDay}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request.weekday} ${request.timeOfDay}`"
              :value="request"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="request in appointmentRequests.filter(
                (req, i) => i % 5 === 4
              )"
              :key="`${request.weekday}-${request.timeOfDay}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request.weekday} ${request.timeOfDay}`"
              :value="request"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn color="error" text @click="$emit('dialogClosed')">
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" button @click="findAppointments()">
          Suchen
        </v-btn>
      </v-card-actions>
    </div>
    <div v-else-if="appointmentSuggestions.length > 0">
      <v-card-text>
        <p class="pl-3">Folgende Termine stehen zur Auswahl:</p>
        <v-row class="pl-3">
          <v-col>
            <v-radio-group v-model="selectedAppointmentSuggestion">
              <v-radio
                v-for="suggestion in appointmentSuggestions"
                :key="suggestion.therapist"
                :label="`${suggestion.therapist} ${suggestion.weekday} ${suggestion.getTimeAsString()}`"
                :value="suggestion"
              ></v-radio>
            </v-radio-group>
            {{ selectedAppointmentSuggestion }}
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn color="error" text @click="$emit('dialogClosed')">
          Abbrechen
        </v-btn>
        <v-spacer v-if="selectedAppointmentSuggestion !== 0"></v-spacer>
        <v-btn
          v-if="selectedAppointmentSuggestion !== 0"
          color="primary"
          button
          @click="takeAppointmentSuggestion()"
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </div>
    <div v-else>
      <v-card-text>
        <p class="pl-3">
          Es wurde kein Termin gefunden. Bitte legen Sie manuell einen Termin
          über die Stammliste an.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" button @click="$emit('dialogClosed')">
          Bestätigen
        </v-btn>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script lang="ts">

import AppointmentFinder from '@/class/AppointmentFinder';
import AppointmentRequest from '@/class/AppointmentRequest';
import AppointmentSeries from '@/class/AppointmentSeries';
import { TimeOfDay } from '@/class/Enums';
import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component
export default class Terminfinder extends Vue {
  private patientTextfield = '';

  therapists: string[] = [];

  selectedTherapists: string[] = [];

  appointmentRequests = AppointmentRequest.generateAll();

  timesOfDay = [TimeOfDay.MORNING, TimeOfDay.FORENOON, TimeOfDay.NOON, TimeOfDay.AFTERNOON, TimeOfDay.EVENING];

  selectedAppointmentRequests: AppointmentRequest[] = [];

  appointmentSuggestions: AppointmentSeries[] = [];

  selectedAppointmentSuggestion: AppointmentSeries | number = 0;

  appointmentSearchStarted = false;

  store = getModule(Store);

  mounted(): void {
    const backup = this.store.getBackup;
    if (backup) {
      const today = new Date();
      this.therapists = backup.therapists.filter(
        (therapist) => therapist.activeSince < today && therapist.activeUntil > today,
      ).map((therapist) => therapist.name);
    }
  }

  findAppointments(): void {
    const appointmentFinder = new AppointmentFinder(this.patientTextfield, this.selectedTherapists, this.selectedAppointmentRequests);
    this.appointmentSuggestions = appointmentFinder.getSuggestions();
    this.appointmentSearchStarted = true;
  }

  takeAppointmentSuggestion(): void {
    console.log(this.selectedAppointmentSuggestion);
    this.$emit('dialogClosed');
  }
}

</script>
