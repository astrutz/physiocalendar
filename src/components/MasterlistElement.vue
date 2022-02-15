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
          <v-radio-group
            v-model="seriesType"
            row
            class="radio-group-full-width"
            mandatory
          >
            <v-radio label="Enddatum" value="endDate"></v-radio>
            <v-spacer></v-spacer>
            <v-radio label="Anzahl Termine" value="counted"></v-radio>
          </v-radio-group>
        </v-row>
        <v-row class="pl-3">
          <v-text-field
            label="Enddatum"
            :value="endDate"
            v-model="endDateTextfield"
            clearable
          ></v-text-field>
          <v-spacer />
          <v-text-field
            label="Anzahl der Termine"
            type="number"
            :value="appointmentCount"
            v-model="appointmentCountTextfield"
          ></v-text-field>
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
import { Weekday } from '@/class/Enums';
import {
  Component, Prop, Vue,
} from 'vue-property-decorator';

@Component
export default class MasterlistElement extends Vue {
  @Prop() readonly patient!: string;

  @Prop() readonly time!: string;

  @Prop() readonly day!: Weekday;

  @Prop() readonly therapist!: string;

  // TODO: Get these over backup somehow

  // @Prop() readonly startDate!: Date;

  // @Prop() readonly endDate!: Date;

  // @Prop() readonly hasEnd!: boolean;

  private dialogIsOpen = false;

  private patientTextfield = this.patient;

  private seriesType: 'endDate' | 'counted' = 'endDate';

  private appointmentCountTextfield = '';

  private endDateTextfield = '';

  changeAppointment(): void {
    if (this.patientTextfield !== '') {
      this.$emit('appointmentChanged', { patient: this.patientTextfield, therapist: this.therapist, time: this.time });
    } else {
      this.$emit('appointmentDeleted', { patient: this.patient, therapist: this.therapist, time: this.time });
    }
  }

  addAppointment(): void {
    this.$emit('appointmentAdded', { patient: this.patientTextfield, therapist: this.therapist, time: this.time });
  }
}
</script>

<style scoped lang="scss">
.radio-group-full-width {
  width: 100%;
}
</style>
