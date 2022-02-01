<template>
  <v-dialog v-model="dialogIsOpen" width="600">
    <template v-slot:activator="{ on, attrs }">
      <v-btn text @click="dialogIsOpen = true" v-bind="attrs" v-on="on">{{
        patient
      }}</v-btn>
    </template>

    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ therapist }} - {{ date }} - {{ time }}
      </v-card-title>

      <v-card-text class="pt-5">
        <v-text-field
          label="Name des Patienten"
          :value="patient"
          v-model="patientTextfield"
        ></v-text-field>
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
            patient !== '' ? changeAppointment(patientTextfield) : addAppointment(patientTextfield);
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
import {
  Component, Prop, Vue,
} from 'vue-property-decorator';

@Component
export default class Daylist extends Vue {
  @Prop() readonly patient!: string;

  @Prop() readonly time!: string;

  @Prop() readonly date!: string;

  @Prop() readonly therapist!: string;

  private dialogIsOpen = false;

  private patientTextfield = this.patient;

  changeAppointment(): void {
    this.$emit('appointmentChanged', { patient: this.patientTextfield, therapist: this.therapist, time: this.time });
  }

  addAppointment(): void {
    this.$emit('appointmentAdded', { patient: this.patientTextfield, therapist: this.therapist, time: this.time });
  }
}
</script>
