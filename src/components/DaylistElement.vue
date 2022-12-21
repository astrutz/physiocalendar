<template>
  <v-dialog persistent v-model="dialogIsOpen" width="600">
    <template v-slot:activator="{ on, attrs }">
      <button
        style="width: 100%; height: 100%"
        type="button"
        @click="dialogIsOpen = true"
        v-bind="attrs"
        v-on="on"
      >
        <span
          :class="{
            appointmentSeries: appointment.startDate,
            cancelled: appointment.startDate && isException,
          }"
          >{{ patient }}</span
        >
        <span
          v-if="appointment.startDate && isException"
        >
          <br><span>{{ replacementPatient }}</span>
        </span>
      </button>
    </template>

    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ therapist }} - {{ date }} - {{ startTime }} bis {{endTime}}
      </v-card-title>

      <v-card-text class="pt-5">
        <v-text-field
          :disabled="!!appointment.startDate"
          label="Name des Patienten"
          :value="patient"
          v-model="patientTextfield"
          clearable
        ></v-text-field>

        <v-select
          :disabled="!!appointment.startDate"
          :items="getAllTimes()"
          label="Start um"
          v-model="startTimeSelect"
          :value="appointment.startTime"
        ></v-select>

        <v-select
          :disabled="!!appointment.startDate"
          :items="getAllTimes()"
          label="Ende um"
          v-model="endTimeSelect"
          :value="appointment.endTime"
        ></v-select>

        <div v-if="!!appointment.startDate">
          <v-alert type="warning"
            >Dieser Termin wurde aus der Stammliste generiert und kann daher
            nicht in der Terminliste verändert werden.
          </v-alert>
          <v-checkbox
            label="Termin fällt aus"
            v-model="isExceptionField"
            :value="isExceptionField"
          ></v-checkbox>
          <v-text-field
          v-if="isExceptionField"
          label="Ersatzpatient"
          :value="replacementPatient"
          v-model="replacementPatientTextField"
          clearable
        ></v-text-field>
        </div>
        <v-alert
          v-if="appointmentsForPatient.length > 0 && !appointment.startDate"
          type="info"
        >
          Unter diesem Namen wurden weitere Termine gefunden:
          <div
            v-for="appointment in appointmentsForPatient"
            :key="`${appointment.therapistID}-${appointment.startTime}-${appointment.weekday}`"
          >
            {{
              appointment.weekday
                ? appointment.weekday + "s"
                : convertDate(appointment.date)
            }}, {{ appointment.startTime }} bei
            {{ appointment.therapist }}
          </div>
        </v-alert>
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
          v-if="patient !== '' && !appointment.startDate"
          color="primary"
          @click="printAppointment()"
          text
        >
          Drucken
        </v-btn>
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
import Appointment from '@/class/Appointment';
import Printer from '@/class/Printer';
import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import { Time } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';
import { getModule } from 'vuex-module-decorators';
import Backup from '@/class/Backup';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import Store from '../store/backup';

@Component
export default class DaylistElement extends Vue {
  @Prop() readonly patient!: string;

  @Prop() readonly startTime!: string;

  @Prop() readonly endTime!: string;

  @Prop() readonly date!: string;

  @Prop() readonly therapist!: string;

  @Prop() readonly therapistID!: string;

  @Prop() readonly isException!: boolean;

  @Prop() readonly replacementPatient!: string;

  @Prop() readonly appointment!: Appointment;

  @Prop() readonly id!: string;

  store = getModule(Store);

  private dialogIsOpen = false;

  private patientTextfield = this.patient;

  private startTimeSelect = this.startTime;

  private endTimeSelect = this.endTime;

  private isExceptionField = !!this.isException;

  private replacementPatientTextField = this.replacementPatient;

  appointmentsForPatient: Appointment[] = [];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  mounted(): void {
    if (this.localBackup) {
      this.appointmentsForPatient = this.localBackup.daylist.getSingleAppointmentsByPatient(this.patient);
      this.appointmentsForPatient = this.appointmentsForPatient.concat(
        this.localBackup.masterlist.getAppointmentSeriesByPatient(this.patient),
      );
      this.appointmentsForPatient = this.appointmentsForPatient.concat(
        this.localBackup.masterlist.getReplacementsByPatient(this.patient),
      );
      this.appointmentsForPatient = this.appointmentsForPatient.filter((appointment) => {
        if (this.appointment instanceof SingleAppointment && appointment instanceof SingleAppointment) {
          return !(appointment.startTime === this.appointment.startTime
            && this.appointment.date === appointment.date
            && this.appointment.therapistID === appointment.therapistID);
        }
        return true;
      });
    }
  }

  private changeAppointment(): void {
    if (this.patientTextfield !== '' && this.patientTextfield !== null) {
      if ((this.appointment as AppointmentSeries).startDate) {
        if (this.isExceptionField !== this.isException) {
          if (this.isExceptionField) {
            this.$emit('exceptionAdded', {
              isException: this.isExceptionField,
              patient: this.replacementPatientTextField,
              appointment: this.appointment as AppointmentSeries,
            });
          } else {
            this.$emit('exceptionDeleted', {
              isException: this.isExceptionField,
              patient: this.replacementPatientTextField,
              appointment: this.appointment as AppointmentSeries,
            });
          }
        } else if (this.replacementPatient !== this.replacementPatientTextField) {
          this.$emit('exceptionChanged', {
            isException: this.isExceptionField,
            patient: this.replacementPatientTextField,
            appointment: this.appointment as AppointmentSeries,
          });
        }
      } else {
        this.$emit('appointmentChanged', {
          patient: this.patientTextfield,
          therapist: this.therapist,
          therapistID: this.therapistID,
          startTime: this.startTimeSelect,
          endTime: this.endTimeSelect,
          id: this.id,
        });
      }
    } else {
      this.$emit('appointmentDeleted', {
        patient: this.patient,
        therapist: this.therapist,
        therapistID: this.therapistID,
        startTime: this.startTimeSelect,
        endTime: this.endTimeSelect,
        id: this.id,
      });
    }
  }

  private addAppointment(): void {
    this.$emit('appointmentAdded', {
      patient: this.patientTextfield,
      therapist: this.therapist,
      therapistID: this.therapistID,
      startTime: this.startTimeSelect,
      endTime: this.endTimeSelect,
    });
  }

  private printAppointment(): void {
    const printer = new Printer(
      this.patient,
      this.therapist,
      this.startTime as unknown as Time,
      this.endTime as unknown as Time,
      Dateconversions.convertReadableStringToDate(this.date),
      0,
    );
    printer.printSingleAppointment(this.appointmentsForPatient);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertDate(date: Date): string {
    return Dateconversions.convertDateToReadableString(date);
  }

  // eslint-disable-next-line class-methods-use-this
  private getAllTimes(): string[] {
    return Dateconversions.getAllTimes();
  }
}
</script>

<style scoped>
  .cancelled {
    text-decoration: line-through;
  }
</style>
