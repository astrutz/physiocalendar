<template>
  <v-dialog persistent v-model="dialogIsOpen" width="800">
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
            cancelled: appointment.startTime && isException,
          }"
          >{{ patient }}</span
        >
        <span v-if="appointment.startTime && isException">
          <br /><span>{{ patient1 }} {{ startTime1 }} - {{ endTime1 }}</span>
        </span>
      </button>
    </template>

    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ therapist }} - {{ weekday }} {{ date }} - {{ startTime }} bis
        {{ endTime }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-combobox
          :disabled="!isSingleAppointment"
          :value="patient"
          v-model="patientTextfield"
          :loading="patientsLoading"
          :items="foundPatients"
          :search-input.sync="searchValue"
          @input="searchAppointmentsForPatient($event)"
          class="mb-4 mt-0"
          flat
          hide-no-data
          hide-details
          clearable
          label="Name des Patienten"
        ></v-combobox>

        <v-select
          :disabled="!isSingleAppointment"
          :items="getAllTimes()"
          label="Start um"
          v-model="startTimeSelect"
          :value="appointment.startTime"
        ></v-select>

        <v-select
          :disabled="!isSingleAppointment"
          :items="getAllTimes()"
          label="Ende um"
          v-model="endTimeSelect"
          :value="appointment.endTime"
        ></v-select>

        <v-text-field
          :disabled="!isSingleAppointment"
          label="Sonstige Bemerkungen"
          :value="appointment.comment"
          v-model="commentTextfield"
          clearable
        ></v-text-field>

        <v-row>
          <v-col>
            <v-checkbox
              :disabled="!isSingleAppointment"
              label="Heißluft"
              v-model="isHotairField"
              :value="isHotairField"
            ></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox
              :disabled="!isSingleAppointment"
              label="Ultraschall"
              v-model="isUltrasonicField"
              :value="isUltrasonicField"
            ></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox
              :disabled="!isSingleAppointment"
              label="Elektro"
              v-model="isElectricField"
              :value="isElectricField"
            ></v-checkbox>
          </v-col>
        </v-row>
        <div v-if="!isSingleAppointment">
          <v-row no-gutters>
          <v-col cols="8">
          <v-alert type="warning"
            >Dieser Termin wurde aus der Stammliste generiert und kann daher
            nicht in der Terminliste verändert werden.
          </v-alert>
          </v-col>
          <v-col cols="1"><v-spacer>  </v-spacer></v-col>
          <v-col cols="3">
          <center>
          <v-checkbox
            label="Termin fällt aus"
            v-model="isExceptionField"
            :value="isExceptionField"
          ></v-checkbox>
         </center>
         </v-col>
          </v-row>
          <center>
          <v-btn v-if="isExceptionField"
          color="warning"
          text
          >
          Ersatz Termin
          </v-btn>
          <v-btn v-if="false"
          color="warning"
          @click="addTwoRepPatient()"
          text
          >
          +2 Ersatz Termin
         </v-btn>
         </center>
        <center>
        <div v-if="isExceptionField && requireOnePatient">
          <v-row>
              <v-text-field
                label="Ersatzpatient"
                v-model="patientTextField1"
                :value="patient1"
                clearable
              ></v-text-field>
              <v-text-field
               label="Bemerkungen"
               :value="comment1"
               v-model="commentTextfield1"
               clearable
              ></v-text-field>
              </v-row>
              <v-row>
              <v-select
               :items="getAllTimes()"
               label="Start um"
               v-model="startTimeSelect1"
               :value="startTimeSelect"
              ></v-select>
              <v-select
               :items="getAllTimes()"
               label="Ende um"
               v-model="endTimeSelect1"
               :value="endTimeSelect"
              ></v-select>
              </v-row>
              <v-row>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Heißluft"
              v-model="isHotairField1"
              :value="isHotairField1"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Ultraschall"
              v-model="isUltrasonicField1"
              :value="isUltrasonicField1"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Elektro"
              v-model="isElectricField1"
              :value="isElectricField1"
              ></v-checkbox>
              </v-col>
              <v-col>
                <v-btn v-if="isExceptionField"
              color="error"
              @click="deleteReplacementAppointment1()"
              text
              >
              Ersatz Termin Löschen
              </v-btn>
              </v-col>
              </v-row>
            </div>
        </center>
        </div>
        <v-alert
          v-if="appointmentsForPatient.length > 0 && !appointment.startTime"
          type="info"
        >
          Unter diesem Namen wurden weitere Termine gefunden:
          <div
            v-for="appointment in appointmentsForPatient"
            :key="`${appointment.therapistID}-${appointment.startTime}-${weekday}`"
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
          color="normal"
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
          v-if="isSingleAppointment"
          color="error"
          text
          @click="deleteSingleAppointment()"
        >
          Einzeltermin löschen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="true"
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
              ? changeAppointment()
              : addAppointment();
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
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { Time } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';
import { getModule } from 'vuex-module-decorators';
import Backup from '@/class/Backup';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import Util from '@/class/Util';
import Store from '../store/backup';

@Component
export default class DaylistElement extends Vue {
  @Prop() readonly patient!: string;

  @Prop() readonly patient1!: string;

  @Prop() readonly startTime!: string;

  @Prop() readonly startTime1!: string;

  @Prop() readonly endTime!: string;

  @Prop() readonly endTime1!: string;

  @Prop() readonly comment1!: string;

  @Prop() readonly date!: string;

  @Prop() readonly therapist!: string;

  @Prop() readonly therapistID!: string;

  @Prop() readonly isException!: boolean;

  @Prop() readonly replacementPatient!: string;

  @Prop() readonly appointment!: Appointment;

  @Prop() readonly id!: string;

  @Prop() readonly weekday!: string;

  @Prop() readonly isHotair!: boolean;

  @Prop() readonly isUltrasonic!: boolean;

  @Prop() readonly isElectric!: boolean;

  @Prop() readonly isHotair1!: boolean;

  @Prop() readonly isUltrasonic1!: boolean;

  @Prop() readonly isElectric1!: boolean;

  @Prop() readonly isSingleApp!: boolean;

  @Prop() readonly reqOnePatient!: boolean;

  store = getModule(Store);

  public dialogIsOpen = false;

  public patientTextfield = this.patient;

  public patientTextField1 = this.patient1;

  public startTimeSelect = this.startTime;

  public startTimeSelect1 = this.startTime1;

  public endTimeSelect = this.endTime;

  public endTimeSelect1 = this.endTime1;

  public commentTextfield = this.appointment.comment || '';

  public commentTextfield1 = this.comment1 || '';

  public isExceptionField = !!this.isException;

  public isHotairField = !!this.isHotair;

  public isUltrasonicField = !!this.isUltrasonic;

  public isElectricField = !!this.isElectric;

  public isHotairField1 = !!this.isHotair1;

  public isUltrasonicField1 = !!this.isUltrasonic1;

  public isElectricField1 = !!this.isElectric1;

  public replacementPatientTextField = this.replacementPatient;

  appointmentsForPatient: Appointment[] = [];

  public requireOnePatient = !!this.reqOnePatient;

  public requireTwoPatient = false;

  public isSingleAppointment = !!this.isSingleApp;

  public patientsLoading = false;

  public searchValue = '';

  public foundPatients : string[] = [];

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

  @Watch('searchValue')
  searchValueChanged(val: string | undefined): boolean {
    this.foundPatients = [];
    this.patientTextfield = val || this.patientTextfield;
    this.searchPatients(val);
    return val !== this.patientTextfield;
  }

  public searchAppointmentsForPatient(patient: string): void {
    if (this.localBackup) {
      let appointments: Appointment[] = this.localBackup.daylist.getSingleAppointmentsByPatient(patient);
      appointments = appointments.concat(this.localBackup.masterlist.getAppointmentSeriesByPatient(patient));
      appointments = appointments.concat(this.localBackup.masterlist.getReplacementsByPatient(patient));
      this.appointmentsForPatient = appointments;
    }
  }

  public changeAppointment(): void {
    if ((this.appointment as AppointmentSeries).startTime) {
      console.log('speichern einzel Termin');
      this.$emit('appointmentChanged', {
        patient: this.patientTextfield,
        therapist: this.therapist,
        therapistID: this.therapistID,
        startTime: this.startTimeSelect,
        endTime: this.endTimeSelect,
        comment: this.commentTextfield,
        id: this.id,
        isHotair: this.isHotairField,
        isUltrasonic: this.isUltrasonicField,
        isElectric: this.isElectricField,
      });
      // if (this.patient1 !== '') this.addRepAppointment();
    }
    if (this.patientTextfield !== null) {
      if ((this.appointment as AppointmentSeries).startTime) {
        // eslint-disable-next-line
        const patientKey = this.patientTextField1 + ';'
          // eslint-disable-next-line
          + this.startTimeSelect1 + ';' + this.endTimeSelect1 + ';' + this.commentTextfield1 + ';' + (this.isHotairField1 ? 'true' : 'false') + ';' + (this.isUltrasonicField1 ? 'true' : 'false') + ';' + (this.isElectricField1 ? 'true' : 'false');
          // TODO eventuell eher über speichern ersatztermin > rückgabe Appointment id >
          // appointment id ins Patient Feld schreiben daraus dann die daten für Ersatztermin ziehen
        if (this.isExceptionField !== this.isException) {
          if (this.isExceptionField) {
            // Serien Termin fällt aus
            this.$emit('exceptionAdded', {
              isException: this.isExceptionField,
              patient: patientKey,
              appointment: this.appointment as AppointmentSeries,
            });
            // this.addRepAppointment();
          } else {
            // Serien Termin fällt nicht aus
            this.$emit('exceptionDeleted', {
              isException: this.isExceptionField,
              patient: this.patientTextField1,
              appointment: this.appointment as AppointmentSeries,
            });
          }
        } else if (this.isExceptionField === this.isException) {
          (this.appointment as AppointmentSeries).cancellations.forEach((cancellation) => {
            // console.log(cancellation.patient);
          });
          debugger;
          // speichern Serien Termin
          // console.log(patientKey);
          this.$emit('exceptionChanged', {
            isException: this.isExceptionField,
            patient: patientKey,
            appointment: this.appointment as AppointmentSeries,
          });
        }
      }
    } else {
      this.$emit('appointmentDeleted', {
        patient: this.patient,
        therapist: this.therapist,
        therapistID: this.therapistID,
        startTime: this.startTimeSelect,
        endTime: this.endTimeSelect,
        comment: this.commentTextfield,
        id: this.id,
        isHotair: this.isHotairField,
        isUltrasonic: this.isUltrasonicField,
        isElectric: this.isElectricField,
      });
    }
  }

  public addAppointment(): void {
    this.$emit('appointmentAdded', {
      patient: this.patientTextfield,
      therapist: this.therapist,
      therapistID: this.therapistID,
      startTime: this.startTimeSelect,
      endTime: this.endTimeSelect,
      comment: this.commentTextfield,
      isHotair: this.isHotairField,
      isUltrasonic: this.isUltrasonicField,
      isElectric: this.isElectricField,
    });
  }

  public addRepAppointment(): void {
    this.$emit('repAppointmentAdded', {
      patient1: this.patientTextField1,
      therapist1: this.therapist,
      therapistID1: this.therapistID,
      startTime1: this.startTimeSelect1,
      endTime1: this.endTimeSelect1,
      comment1: this.commentTextfield1,
      isHotair1: this.isHotairField1,
      isUltrasonic1: this.isUltrasonicField1,
      isElectric1: this.isElectricField1,
    });
  }

  public addOneRepPatient(): void {
    this.requireOnePatient = true;
    this.patientTextField1 = '';
    this.startTimeSelect1 = this.startTimeSelect;
    this.endTimeSelect1 = this.endTimeSelect;
    this.commentTextfield1 = '';
    this.isHotairField1 = false;
    this.isUltrasonicField1 = false;
    this.isElectricField1 = false;
  }

  public addTwoRepPatient(): void {
    this.requireTwoPatient = true;
  }

  public deleteSingleAppointment(): void {
    /* eslint-disable */
    if (window.confirm('Soll dieser Termin wirklich unwiederruflich gelöscht werden?')) {
    // löschen eines single appointments
      this.$emit('appointmentDeleted', {
        patient: this.patient,
        therapist: this.therapist,
        therapistID: this.therapistID,
        startTime: this.startTimeSelect,
        endTime: this.endTimeSelect,
        comment: this.commentTextfield,
        id: this.id,
        isHotair: this.isHotairField,
        isUltrasonic: this.isUltrasonicField,
        isElectric: this.isElectricField,
      });
      this.requireOnePatient = false;
      this.requireTwoPatient = false;
      this.dialogIsOpen = false;
    }
  }

  public deleteReplacementAppointment1(): void {
    // To do: löschen rep appointment see delete Appointment
    this.requireOnePatient = false;
    this.requireTwoPatient = false;
    this.patientTextField1 = '';
    this.commentTextfield1 = '';
    this.startTimeSelect1 = this.startTimeSelect;
    this.endTimeSelect1 = this.endTimeSelect;
    this.isHotairField1 = false;
    this.isUltrasonicField1 = false;
    this.isElectricField1 = false;
  }

  public printAppointment(): void {
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

  public searchPatients(searchQuery : string | undefined) : void {
    if (searchQuery && searchQuery.length > 2 && this.localBackup) {
      this.patientsLoading = true;
      this.foundPatients = Util.searchPatientNames(this.localBackup, searchQuery);
      this.patientsLoading = false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public convertDate(date: Date): string {
    return Dateconversions.convertDateToReadableString(date);
  }

  // eslint-disable-next-line class-methods-use-this
  public getAllTimes(): string[] {
    return Dateconversions.getAllTimes();
  }
}
</script>

<style scoped>
.cancelled {
  text-decoration: line-through;
}
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

</style>
