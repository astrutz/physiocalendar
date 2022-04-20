<template>
  <v-dialog persistent v-model="dialogIsOpen" width="600">
    <template v-slot:activator="{ on, attrs }">
      <button
        style="width: 100%"
        type="button"
        @click="dialogIsOpen = true"
        v-bind="attrs"
        v-on="on"
      >
        {{ patient }}
      </button>
    </template>

    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ therapist }} - {{ day.toLowerCase() }}s - {{ time }}
      </v-card-title>

      <v-card-text class="pt-5">
        <v-text-field
          label="Name des Patienten"
          :value="patient"
          v-model="patientTextfield"
          clearable
        ></v-text-field>
        <v-row class="pl-3">
          <v-checkbox
            label="Termin hat ein Ablaufdatum"
            v-model="hasEnd"
            :value="hasEnd"
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
              @input="
                menuIsOpen = false;
                endDate = getCombinedDate();
              "
              locale="de-de"
            ></v-date-picker>
          </v-menu>
        </v-row>
        <v-alert v-if="conflicts.length > 0" type="error" class="mt-4"
          >Dieser Termin kann nicht gespeichert werden, da er mit folgenden
          Terminen kollidiert:
          <ul>
            <li
              v-for="conflict in conflicts"
              :key="conflict.date.toLocaleDateString()"
            >
              {{ conflict.patient }} - {{ conflict.date.toLocaleDateString() }},
              {{ conflict.time }}
            </li>
          </ul>
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          color="error"
          text
          @click="
            hasEnd = appointment.hasEnd || false;
            patientTextfield = patient;
            dialogIsOpen = false;
          "
        >
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="patient !== ''" color="primary" text> Drucken </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="conflicts.length > 0"
          color="primary"
          button
          @click="
            patient !== '' ? changeAppointment() : addAppointment();
            dialogIsOpen = false;
          "
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import AppointmentSeries from '@/class/AppointmentSeries';
import Backup from '@/class/Backup';
import Dateconversions from '@/class/Dateconversions';
import { Time, Weekday } from '@/class/Enums';
import SingleAppointment from '@/class/SingleAppointment';
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component
export default class MasterlistElement extends Vue {
  @Prop() readonly patient!: string;

  @Prop() readonly time!: string;

  @Prop() readonly therapist!: string;

  @Prop() readonly day!: Weekday;

  @Prop() readonly appointment!: AppointmentSeries;

  store = getModule(Store);

  private appointmentPatient = this.appointment.patient;

  private appointmentPatientTime = this.appointment.time.toString();

  private appointmentTherapist = this.appointment.therapist;

  private endDate = this.appointment?.endDate || new Date();

  private endDateString: string = new Date(this.endDate.getTime() - this.endDate.getTimezoneOffset() * 60000).toISOString().substr(0, 10);

  private endDateStringFormatted: string = Dateconversions.convertEnglishToGermanReadableString(this.endDateString);

  private hasEnd = this.appointment?.hasEnd || false;

  private dialogIsOpen = false;

  private menuIsOpen = false;

  private patientTextfield = this.appointmentPatient;

  private conflicts: SingleAppointment[] = [];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('dialogIsOpen')
  dialogIsOpenChanged(): void {
    this.getAppointmentConflicts();
  }

  @Watch('hasEnd')
  hasEndChanged(): void {
    this.getAppointmentConflicts();
  }

  @Watch('endDateString')
  dateChanged(): void {
    this.getAppointmentConflicts();
    this.endDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(this.endDateString);
  }

  getAppointmentConflicts(): void {
    if (this.localBackup) {
      this.localBackup.daylist.getAppointmentConflicts(
        this.day,
        this.hasEnd,
        this.therapist,
        this.endDate,
        this.time as unknown as Time,
      );
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

  changeAppointment(): void {
    if (this.patientTextfield !== '' && this.patientTextfield !== null) {
      this.$emit('appointmentChanged', {
        patient: this.patientTextfield,
        therapist: this.therapist,
        time: this.time,
        hasEnd: this.hasEnd,
        endDate: this.hasEnd ? this.endDate : null,
      });
    } else {
      this.$emit('appointmentDeleted', {
        patient: this.patient, therapist: this.therapist, time: this.time, hasEnd: this.hasEnd,
      });
    }
  }

  addAppointment(): void {
    this.$emit('appointmentAdded', {
      patient: this.patientTextfield,
      therapist: this.therapist,
      time: this.time,
      hasEnd: this.hasEnd,
      endDate: this.hasEnd ? this.endDate : null,
    });
  }
}
</script>

<style scoped lang="scss">
.radio-group-full-width {
  width: 100%;
}
</style>
