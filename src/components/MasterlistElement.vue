<template>
  <v-dialog v-model="dialogIsOpen" width="600">
    <template v-slot:activator="{ on, attrs }">
      <v-btn text @click="dialogIsOpen = true" v-bind="attrs" v-on="on">{{
        patient
      }}</v-btn>
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
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="error" text @click="dialogIsOpen = false">
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="patient !== ''" color="primary" text> Drucken </v-btn>
        <v-spacer></v-spacer>
        <v-btn
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
import Dateconversions from '@/class/Dateconversions';
import { Weekday } from '@/class/Enums';
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';

@Component
export default class MasterlistElement extends Vue {
  @Prop() readonly patient!: string;

  @Prop() readonly time!: string;

  @Prop() readonly therapist!: string;

  @Prop() readonly day!: Weekday;

  @Prop() readonly appointment!: AppointmentSeries | undefined;

  private appointmentPatient = this.appointment?.patient || this.patient;

  private appointmentPatientTime = this.appointment?.time.toString() || this.time;

  private appointmentTherapist = this.appointment?.therapist || this.therapist;

  private endDate = this.appointment?.endDate || new Date();

  private endDateString: string = new Date(this.endDate.getTime() - this.endDate.getTimezoneOffset() * 60000).toISOString().substr(0, 10);

  private endDateStringFormatted: string = Dateconversions.convertEnglishToGermanReadableString(this.endDateString);

  private hasEnd = this.appointment?.hasEnd || false;

  private dialogIsOpen = false;

  private menuIsOpen = false;

  private patientTextfield = this.appointmentPatient;

  @Watch('endDateString')
  dateChanged(): void {
    this.endDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(this.endDateString);
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
    console.log(this.patientTextfield);
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
