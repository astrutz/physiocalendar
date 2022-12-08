<template>
  <v-stepper v-model="currentStep" non-linear>
    <v-stepper-header>
      <v-stepper-step editable :complete="currentStep > 1" step="1" @click="resetSelectedAppointmentSuggestions()">
        Patientendaten eintragen
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step editable :complete="currentStep > 2" step="2">
        Verfügbaren Termin auswählen
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step step="3"> Auswahl bestätigen </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
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
          >
            <template v-slot:label>
              <div>{{ label }}</div>
            </template>
            <template v-slot:prepend-item>
              <v-list-item ripple @click="toggleAllTherapists">
                <v-list-item-action>
                  <v-icon
                    :color="
                      selectedTherapists.length > 0 ? 'indigo darken-4' : ''
                    "
                    >{{ icon }}</v-icon
                  >
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Alle auswählen</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="mt-2"></v-divider>
            </template>
          </v-select>
        </v-row>
        <v-row class="pl-3">
          <v-col>
            <v-text-field
              label="Anzahl der Termine"
              v-model="appointmentCount"
              clearable
              type="number"
              max="40"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              :items="availableAppoinmentLengths"
              label="Dauer der Termine"
              v-model="appointmentLength"
            >
            </v-select>
          </v-col>
        </v-row>
        <v-row class="pl-3 mt-6">
          <h3 style="color: black">Mögliche Termine (mindestens drei auswählen)</h3>
        </v-row>
        <v-row class="pl-3 mt-6 mb-3">
          <v-btn
            @click="toggleAllSlots()"
            :color="selectedAppointmentRequests.length === appointmentRequests.length ? '' : 'primary'"
          >
            Alle {{selectedAppointmentRequests.length === appointmentRequests.length ? 'abwählen' : 'auswählen'}}
            </v-btn>
        </v-row>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon style="float: right" v-bind="attrs" v-on="on" large>
              mdi-information
            </v-icon>
          </template>
          <span
            >Die Tageszeiten sind wie folgt definiert:
            <ul>
              <li>Morgen: 07:00 bis 10:00</li>
              <li>Vormittag: 10:00 bis 12:00</li>
              <li>Mittag: 12:00 bis 15:00</li>
              <li>Nachmittag: 15:00 bis 18:00</li>
              <li>Abend: 18:00 bis 20:00</li>
            </ul>
          </span>
        </v-tooltip>
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

        <v-btn @click="resetFinder()" color="error" text> Abbrechen </v-btn>
        <v-btn
          class="button-next"
          :disabled="
            patientTextfield === '' ||
            selectedTherapists.length === 0 ||
            selectedAppointmentRequests.length < 3 ||
            appointmentCount === 0
          "
          color="primary"
          @click="
            findAppointments();
            currentStep = 2;
          "
        >
          Fortfahren
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <div v-if="appointmentSuggestions.length > 0" style="overflow-y: scroll; overflow-x: hidden; max-height: 500px">
          <p class="pl-3">Folgende Termine stehen zur Auswahl: {{appointmentSuggestions.length}}</p>
          <v-row class="pl-3">
            <v-col
              v-for="suggestion in appointmentSuggestions"
              :key="`${suggestion.therapist}-${suggestion.date}-${suggestion.startTime}-${Math.random()}`"
              cols="4"
              style="padding: 0"
            >
              <v-checkbox
                :label="`${suggestion.therapist}, ${convertSuggestionDate(
                  suggestion.date
                )} um ${suggestion.startTime}`"
                :value="suggestion"
                v-model="selectedAppointmentSuggestions"
                :multiple="true"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row class="pl-3 mb-4">
            <strong
              >{{ selectedAppointmentSuggestions.length }} von
              {{ appointmentCount }} Terminen ausgewählt</strong
            >
          </v-row>
          <v-btn @click="resetFinder()" color="error" text> Abbrechen </v-btn>
          <v-btn
            :disabled="
              selectedAppointmentSuggestions.length !==
              parseInt(appointmentCount)
            "
            class="button-next"
            color="primary"
            @click="currentStep = 3"
          >
            Termine auswählen
          </v-btn>
        </div>
        <div v-else>
          <p>
            Es wurde kein Termin gefunden. Bitte legen Sie manuell einen Termin
            über die Terminliste an.
          </p>
          <v-btn
            class="button-next"
            color="primary"
            button
            @click="resetFinder()"
          >
            Bestätigen
          </v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="3">
        <p>Folgende Termine werden in der Terminliste gespeichert:</p>
        <p
          v-for="(suggestion, index) in selectedAppointmentSuggestions"
          :key="`${suggestion}-${index}`"
        >
          <strong>
            {{ suggestion.therapist }},
            {{ convertSuggestionDate(suggestion.date) }} um
            {{ suggestion.startTime }} ({{ appointmentLength }} Minuten)
          </strong>
        </p>
        <v-btn @click="resetFinder()" color="error" text> Abbrechen </v-btn>
        <v-btn
          class="button-next"
          color="primary"
          @click="takeAppointmentSuggestion()"
        >
          Termin speichern
        </v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script lang="ts">

import AppointmentFinder from '@/class/AppointmentFinder';
import AppointmentRequest from '@/class/AppointmentRequest';
import SingleAppointment from '@/class/SingleAppointment';
import Backup from '@/class/Backup';
import Dateconversions from '@/class/Dateconversions';
import { TimeOfDay } from '@/class/Enums';
import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component
export default class Terminfinder extends Vue {
  private patientTextfield = '';

  therapists: string[] = [];

  therapistIDs: string[] = [];

  selectedTherapists: string[] = [];

  appointmentCount = 0;

  appointmentLength = 20;

  availableAppoinmentLengths = [
    { text: '10 Minuten', value: 10 },
    { text: '20 Minuten', value: 20 },
    { text: '30 Minuten', value: 30 },
    { text: '40 Minuten', value: 40 },
    { text: '50 Minuten', value: 50 },
    { text: '60 Minuten', value: 60 },
    { text: '70 Minuten', value: 70 },
    { text: '80 Minuten', value: 80 },
    { text: '90 Minuten', value: 90 },
    { text: '100 Minuten', value: 100 },
    { text: '110 Minuten', value: 110 },
    { text: '120 Minuten', value: 120 }]

  menuIsOpen = false;

  appointmentRequests = AppointmentRequest.generateAll();

  timesOfDay = [TimeOfDay.MORNING, TimeOfDay.FORENOON, TimeOfDay.NOON, TimeOfDay.AFTERNOON, TimeOfDay.EVENING];

  selectedAppointmentRequests: AppointmentRequest[] = [];

  appointmentSuggestions: SingleAppointment[] = [];

  selectedAppointmentSuggestions: SingleAppointment[] = [];

  currentStep = 1;

  store = getModule(Store);

  backup: Backup | null = null;

  mounted(): void {
    this.backup = this.store.getBackup;
    if (this.backup) {
      const today = new Date();
      this.therapists = this.backup.therapists.filter(
        (therapist) => therapist.activeSince < today && therapist.activeUntil > today,
      ).map((therapist) => therapist.name);
      this.therapistIDs = this.backup.therapists.filter(
        (therapist) => therapist.activeSince < today && therapist.activeUntil > today,
      ).map((therapist) => therapist.id);
    }
  }

  get label(): string {
    if (this.selectedTherapists.length === this.therapists.length) {
      return 'Alle Therapeuten ausgewählt';
    }
    if (this.selectedTherapists.length === 0) {
      return 'Therapeuten auswählen';
    }
    return `${this.selectedTherapists.length} Therapeuten ausgewählt`;
  }

  get icon(): string {
    if (this.selectedTherapists.length === this.therapists.length) return 'mdi-close-box';
    if (this.selectedTherapists.length > 0) return 'mdi-minus-box';
    return 'mdi-checkbox-blank-outline';
  }

  toggleAllSlots(): void {
    if (this.selectedAppointmentRequests.length === this.appointmentRequests.length) {
      this.selectedAppointmentRequests = [];
    } else {
      this.selectedAppointmentRequests = this.appointmentRequests.slice();
    }
  }

  toggleAllTherapists(): void {
    if (this.selectedTherapists.length === this.therapists.length) {
      this.selectedTherapists = [];
    } else {
      this.selectedTherapists = this.therapists.slice();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  convertSuggestionDate(date: Date): string {
    return Dateconversions.convertDateToReadableString(date);
  }

  findAppointments(): void {
    if (this.backup) {
      const selectedTherapistIDs: string[] = [];
      this.selectedTherapists.forEach((selectedTherapist) => {
        const index = this.therapists.indexOf(selectedTherapist);
        if (index > -1) {
          selectedTherapistIDs.push(this.therapistIDs[index]);
        }
      });
      const appointmentFinder = new AppointmentFinder(
        this.patientTextfield,
        this.selectedTherapists,
        selectedTherapistIDs,
        this.appointmentCount,
        this.appointmentLength,
        this.selectedAppointmentRequests,
        this.backup.daylist,
        this.backup.masterlist,
        this.backup.therapists,
      );
      this.appointmentSuggestions = appointmentFinder.getSuggestions();
    }
  }

  resetSelectedAppointmentSuggestions() : void {
    this.selectedAppointmentSuggestions = [];
  }

  resetFinder(): void {
    this.currentStep = 1;
    this.patientTextfield = '';
    this.selectedTherapists = [];
    this.selectedAppointmentRequests = [];
    this.selectedAppointmentSuggestions = [];
    this.appointmentSuggestions = [];
    this.appointmentCount = 0;
    this.$emit('dialogClosed');
  }

  takeAppointmentSuggestion(): void {
    if (this.backup) {
      this.selectedAppointmentSuggestions.forEach((suggestion) => {
        this.store.addSingleAppointment(suggestion);
      });
    }
    this.resetFinder();
  }
}

</script>

<style scoped>
.button-next {
  float: right;
}
</style>
