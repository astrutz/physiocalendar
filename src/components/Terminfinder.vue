<template>
  <v-stepper v-model="currentStep">
    <v-stepper-header>
      <v-stepper-step :complete="currentStep > 1" step="1">
        Patientendaten eintragen
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="currentStep > 2" step="2">
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
          ></v-select>
        </v-row>
        <v-row class="pl-3">
          <v-checkbox
            label="Termin hat ein Ablaufdatum"
            v-model="hasEnd"
          ></v-checkbox>
        </v-row>
        <v-row class="pl-3" v-if="hasEnd">
          <v-menu
            v-model="menuIsOpen"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="endDateStringFormatted"
                label="Enddatum"
                persistent-hint
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                @blur="
                  endDateString = convertGermanToEnglishReadableString(
                    endDateStringFormatted
                  )
                "
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="endDateString"
              :allowed-dates="
                (dateVal) => {
                  return new Date(dateVal) > new Date();
                }
              "
              @input="
                menuIsOpen = false;
                endDate = getCombinedDate();
              "
              locale="de-de"
            ></v-date-picker>
          </v-menu>
        </v-row>
        <v-row class="pl-3 mt-6">
          <h3 style="color: black">Mögliche Termine</h3>
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
              <li>Abend: 18:00 bis 21:00</li>
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
            selectedAppointmentRequests.length === 0
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
        <div v-if="appointmentSuggestions.length > 0">
          <p class="pl-3">Folgende Termine stehen zur Auswahl:</p>
          <v-row class="pl-3">
            <v-col cols="2">
              <v-radio-group v-model="selectedAppointmentSuggestion">
                <v-radio
                  v-for="suggestion in appointmentSuggestions.filter(
                    (req, i) => i % 5 === 0
                  )"
                  :key="`${suggestion.therapist}-${suggestion.weekday}-${suggestion.time}`"
                  :label="`${
                    suggestion.therapist
                  }, ${suggestion.weekday.toLowerCase()}s um ${
                    suggestion.time
                  }`"
                  :value="suggestion"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="2">
              <v-radio-group v-model="selectedAppointmentSuggestion">
                <v-radio
                  v-for="suggestion in appointmentSuggestions.filter(
                    (req, i) => i % 5 === 1
                  )"
                  :key="suggestion.therapist"
                  :label="`${
                    suggestion.therapist
                  }, ${suggestion.weekday.toLowerCase()}s um ${
                    suggestion.time
                  }`"
                  :value="suggestion"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="2">
              <v-radio-group v-model="selectedAppointmentSuggestion">
                <v-radio
                  v-for="suggestion in appointmentSuggestions.filter(
                    (req, i) => i % 5 === 2
                  )"
                  :key="suggestion.therapist"
                  :label="`${
                    suggestion.therapist
                  }, ${suggestion.weekday.toLowerCase()}s um ${
                    suggestion.time
                  }`"
                  :value="suggestion"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="2">
              <v-radio-group v-model="selectedAppointmentSuggestion">
                <v-radio
                  v-for="suggestion in appointmentSuggestions.filter(
                    (req, i) => i % 5 === 3
                  )"
                  :key="suggestion.therapist"
                  :label="`${
                    suggestion.therapist
                  }, ${suggestion.weekday.toLowerCase()}s um ${
                    suggestion.time
                  }`"
                  :value="suggestion"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col cols="2">
              <v-radio-group v-model="selectedAppointmentSuggestion">
                <v-radio
                  v-for="suggestion in appointmentSuggestions.filter(
                    (req, i) => i % 5 === 4
                  )"
                  :key="suggestion.therapist"
                  :label="`${
                    suggestion.therapist
                  }, ${suggestion.weekday.toLowerCase()}s um ${
                    suggestion.time
                  }`"
                  :value="suggestion"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-btn @click="resetFinder()" color="error" text> Abbrechen </v-btn>

          <v-btn
            :disabled="selectedAppointmentSuggestion === 0"
            class="button-next"
            color="primary"
            @click="currentStep = 3"
          >
            Termin auswählen
          </v-btn>
        </div>
        <div v-else>
          <p>
            Es wurde kein Termin gefunden. Bitte legen Sie manuell einen Termin
            über die Stammliste an.
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
        <p>Folgender Termin wird in der Stammliste gespeichert:</p>
        <p v-if="selectedAppointmentSuggestion">
          <strong>
            {{ selectedAppointmentSuggestion.therapist }},
            {{ selectedAppointmentSuggestion.weekday.toLowerCase() }}s um
            {{ selectedAppointmentSuggestion.time }}
            <span v-if="selectedAppointmentSuggestion.hasEnd">
              bis zum {{ selectedAppointmentSuggestion.endDate }}
            </span>
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
import AppointmentSeries from '@/class/AppointmentSeries';
import Backup from '@/class/Backup';
import Dateconversions from '@/class/Dateconversions';
import { TimeOfDay } from '@/class/Enums';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component
export default class Terminfinder extends Vue {
  private patientTextfield = '';

  therapists: string[] = [];

  therapistIDs: string[] = [];

  selectedTherapists: string[] = [];

  hasEnd = false;

  menuIsOpen = false;

  endDate = new Date();

  endDateString = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10);

  endDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
  );

  appointmentRequests = AppointmentRequest.generateAll();

  timesOfDay = [TimeOfDay.MORNING, TimeOfDay.FORENOON, TimeOfDay.NOON, TimeOfDay.AFTERNOON, TimeOfDay.EVENING];

  selectedAppointmentRequests: AppointmentRequest[] = [];

  appointmentSuggestions: AppointmentSeries[] = [];

  selectedAppointmentSuggestion: AppointmentSeries | number = 0;

  currentStep = 1;

  store = getModule(Store);

  backup: Backup | null = null;

  @Watch('endDateString')
  dateChanged(): void {
    this.endDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(this.endDateString);
  }

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

  getCombinedDate(): Date {
    const timezoneOffsetInHours = new Date(`${this.endDateString}T00:00:00.000Z`).getTimezoneOffset() * -1;
    const offsetSuffix = `${timezoneOffsetInHours < 0 ? '-' : '+'}0${Math.abs(timezoneOffsetInHours / 60)}:00`;
    return new Date(`${this.endDateString}T15:00:00.000${offsetSuffix}`);
  }

  convertGermanToEnglishReadableString(): string {
    return Dateconversions.convertGermanToEnglishReadableString(this.endDateStringFormatted);
  }

  findAppointments(): void {
    if (this.backup) {
      const selectedTherapistIDs : string[] = [];
      // TODO: Test me carefully
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
        this.selectedAppointmentRequests,
        this.hasEnd,
        this.hasEnd ? this.endDate : null,
        this.backup.masterlist,
        this.backup.daylist,
      );
      this.appointmentSuggestions = appointmentFinder.getSuggestions();
    }
  }

  resetFinder(): void {
    this.currentStep = 1;
    this.patientTextfield = '';
    this.selectedTherapists = [];
    this.selectedAppointmentRequests = [];
    this.selectedAppointmentSuggestion = 0;
    this.hasEnd = false;
    this.endDate = new Date();
    this.endDateString = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10);
    this.$emit('dialogClosed');
  }

  takeAppointmentSuggestion(): void {
    if (typeof this.selectedAppointmentSuggestion !== 'number' && this.backup) {
      this.store.addAppointmentSeries(this.selectedAppointmentSuggestion);
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
