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
        <span :class="appointment.startDate ? 'appointmentSeries' : ''">{{
          patient
        }}</span>
      </button>
    </template>

    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ therapist }} - {{ date }} - {{ time }}
      </v-card-title>

      <v-card-text class="pt-5">
        <v-text-field
          :disabled="!!appointment.startDate"
          label="Name des Patienten"
          :value="patient"
          v-model="patientTextfield"
          clearable
        ></v-text-field>
        <p v-if="!!appointment.startDate && appointment.endDate">
          Behandlung bis: {{ appointment.endDate.toLocaleDateString() }}
        </p>
        <v-alert v-if="!!appointment.startDate" type="info"
          >Dieser Termin wurde aus der Stammliste generiert und kann daher nicht
          in der Terminliste verändert werden.</v-alert
        >
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          color="error"
          text
          @click="
            patientTextfield = patient;
            dialogIsOpen = false;
          "
        >
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="patient !== ''"
          color="primary"
          @click="printAppointment()"
          text
        >
          Drucken
        </v-btn>
        <v-spacer v-if="!appointment.startDate"></v-spacer>
        <v-btn
          v-if="!appointment.startDate"
          color="primary"
          button
          @click="
            patient !== ''
              ? changeAppointment(patientTextfield)
              : addAppointment(patientTextfield);
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
import Appointment from '@/class/Appointment';
import Printer from '@/class/Printer';
import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import { Time } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';

@Component
export default class DaylistElement extends Vue {
  @Prop() readonly patient!: string;

  @Prop() readonly time!: string;

  @Prop() readonly date!: string;

  @Prop() readonly therapist!: string;

  @Prop() readonly appointment!: Appointment;

  private dialogIsOpen = false;

  private patientTextfield = this.patient;

  changeAppointment(): void {
    if (this.patientTextfield !== '' && this.patientTextfield !== null) {
      this.$emit('appointmentChanged', { patient: this.patientTextfield, therapist: this.therapist, time: this.time });
    } else {
      this.$emit('appointmentDeleted', { patient: this.patient, therapist: this.therapist, time: this.time });
    }
  }

  addAppointment(): void {
    this.$emit('appointmentAdded', { patient: this.patientTextfield, therapist: this.therapist, time: this.time });
  }

  printAppointment(): void {
    const printer = new Printer(
      this.patient, this.therapist, this.time as unknown as Time, Dateconversions.convertReadableStringToDate(this.date),
    );
    printer.printSingleAppointment();
  }
}
</script>

<style scoped>
.appointmentSeries {
  font-style: italic;
}
</style>
