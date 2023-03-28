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
        <span v-if="!isSingleAppointment && patient1 !== ''">
          <br /><span :class="{ 'is-hotair': isHotair1, 'is-electric': isElectric1, 'is-ultrasonic': isUltrasonic1 }">
            {{ patient1 }} {{ startTime1 }} - {{ endTime1 }}</span>
        </span>
        <span v-if="patient2 !== ''">
          <br /><span :class="{ 'is-hotair': isHotair2, 'is-electric': isElectric2, 'is-ultrasonic': isUltrasonic2 }">
            {{ patient2 }} {{ startTime2 }} - {{ endTime2 }}</span>
        </span>
        <span v-if="patient3 !== ''">
          <br /><span :class="{ 'is-hotair': isHotair3, 'is-electric': isElectric3, 'is-ultrasonic': isUltrasonic3 }">
            {{ patient3 }} {{ startTime3 }} - {{ endTime3 }}</span>
        </span>
        <span v-if="patient4 !== ''">
          <br /><span :class="{ 'is-hotair': isHotair4, 'is-electric': isElectric4, 'is-ultrasonic': isUltrasonic4 }">
            {{ patient4 }} {{ startTime4 }} - {{ endTime4 }}</span>
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
          @click="toggleReplacementPatients(0)"
          >
          Alle Ersatz Termine
          </v-btn>
          <v-btn v-if="isExceptionField"
          color="warning"
          @click="toggleReplacementPatients(1)"
          text
          >
          1
         </v-btn>
         <v-btn v-if="isExceptionField"
          color="warning"
          @click="toggleReplacementPatients(2)"
          text
          >
          2
         </v-btn>
         <v-btn v-if="isExceptionField"
          color="warning"
          @click="toggleReplacementPatients(3)"
          text
          >
          3
         </v-btn>
         <v-btn v-if="isExceptionField"
          color="warning"
          @click="toggleReplacementPatients(4)"
          text
          >
          4
         </v-btn>
         </center>
        </div>
        <div v-if="isExceptionField && showReplacementPatient1">
          <v-row>
              <v-text-field
                label="Ersatzpatient 1"
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
              @click="deleteReplacementAppointment(1)"
              text
              >
              Ersatz Termin Löschen
              </v-btn>
              </v-col>
              </v-row>
            </div>
            <div v-if="isExceptionField && showReplacementPatient2">
            <v-row>
              <v-text-field
                label="Ersatzpatient 2"
                v-model="patientTextField2"
                :value="patient2"
                clearable
              ></v-text-field>
              <v-text-field
               label="Bemerkungen"
               :value="comment2"
               v-model="commentTextfield2"
               clearable
              ></v-text-field>
              </v-row>
              <v-row>
              <v-select
               :items="getAllTimes()"
               label="Start um"
               v-model="startTimeSelect2"
               :value="startTimeSelect2"
              ></v-select>
              <v-select
               :items="getAllTimes()"
               label="Ende um"
               v-model="endTimeSelect2"
               :value="endTimeSelect2"
              ></v-select>
              </v-row>
              <v-row>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Heißluft"
              v-model="isHotairField2"
              :value="isHotairField2"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Ultraschall"
              v-model="isUltrasonicField2"
              :value="isUltrasonicField2"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Elektro"
              v-model="isElectricField2"
              :value="isElectricField2"
              ></v-checkbox>
              </v-col>
              <v-col>
                <v-btn v-if="isExceptionField"
              color="error"
              @click="deleteReplacementAppointment(2)"
              text
              >
              Ersatz Termin Löschen
              </v-btn>
              </v-col>
              </v-row>
            </div>
            <div v-if="isExceptionField && showReplacementPatient3">
          <v-row>
              <v-text-field
                label="Ersatzpatient 3"
                v-model="patientTextField3"
                :value="patient3"
                clearable
              ></v-text-field>
              <v-text-field
               label="Bemerkungen"
               :value="comment3"
               v-model="commentTextfield3"
               clearable
              ></v-text-field>
              </v-row>
              <v-row>
              <v-select
               :items="getAllTimes()"
               label="Start um"
               v-model="startTimeSelect3"
               :value="startTimeSelect3"
              ></v-select>
              <v-select
               :items="getAllTimes()"
               label="Ende um"
               v-model="endTimeSelect3"
               :value="endTimeSelect3"
              ></v-select>
              </v-row>
              <v-row>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Heißluft"
              v-model="isHotairField3"
              :value="isHotairField3"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Ultraschall"
              v-model="isUltrasonicField3"
              :value="isUltrasonicField3"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Elektro"
              v-model="isElectricField3"
              :value="isElectricField3"
              ></v-checkbox>
              </v-col>
              <v-col>
                <v-btn v-if="isExceptionField"
              color="error"
              @click="deleteReplacementAppointment(3)"
              text
              >
              Ersatz Termin Löschen
              </v-btn>
              </v-col>
              </v-row>
            </div>
            <div v-if="isExceptionField && showReplacementPatient4">
            <v-row>
              <v-text-field
                label="Ersatzpatient 4"
                v-model="patientTextField4"
                :value="patient4"
                clearable
              ></v-text-field>
              <v-text-field
               label="Bemerkungen"
               :value="comment4"
               v-model="commentTextfield4"
               clearable
              ></v-text-field>
              </v-row>
              <v-row>
              <v-select
               :items="getAllTimes()"
               label="Start um"
               v-model="startTimeSelect4"
               :value="startTimeSelect4"
              ></v-select>
              <v-select
               :items="getAllTimes()"
               label="Ende um"
               v-model="endTimeSelect4"
               :value="endTimeSelect4"
              ></v-select>
              </v-row>
              <v-row>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Heißluft"
              v-model="isHotairField4"
              :value="isHotairField4"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Ultraschall"
              v-model="isUltrasonicField4"
              :value="isUltrasonicField4"
              ></v-checkbox>
              </v-col>
              <v-col>
              <v-checkbox
              :disabled="false"
              label="Elektro"
              v-model="isElectricField4"
              :value="isElectricField4"
              ></v-checkbox>
              </v-col>
              <v-col>
                <v-btn v-if="isExceptionField"
              color="error"
              @click="deleteReplacementAppointment(4)"
              text
              >
              Ersatz Termin Löschen
              </v-btn>
              </v-col>
              </v-row>
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
  @Prop({ default: '' }) readonly patient!: string;

  @Prop({ default: '' }) readonly patient1!: string;

  @Prop({ default: '' }) readonly patient2!: string;

  @Prop({ default: '' }) readonly patient3!: string;

  @Prop({ default: '' }) readonly patient4!: string;

  @Prop({ default: '' }) readonly startTime!: string;

  @Prop({ default: '' }) readonly startTime1!: string;

  @Prop({ default: '' }) readonly startTime2!: string;

  @Prop({ default: '' }) readonly startTime3!: string;

  @Prop({ default: '' }) readonly startTime4!: string;

  @Prop({ default: '' }) readonly endTime!: string;

  @Prop({ default: '' }) readonly endTime1!: string;

  @Prop({ default: '' }) readonly endTime2!: string;

  @Prop({ default: '' }) readonly endTime3!: string;

  @Prop({ default: '' }) readonly endTime4!: string;

  @Prop({ default: '' }) readonly comment!: string;

  @Prop({ default: '' }) readonly comment1!: string;

  @Prop({ default: '' }) readonly comment2!: string;

  @Prop({ default: '' }) readonly comment3!: string;

  @Prop({ default: '' }) readonly comment4!: string;

  @Prop({ default: '' }) readonly date!: string;

  @Prop({ default: '' }) readonly therapist!: string;

  @Prop({ default: '' }) readonly therapistID!: string;

  @Prop({ default: '' }) readonly isException!: boolean;

  @Prop({ default: '' }) readonly replacementPatient!: string;

  @Prop({ default: '' }) readonly appointment!: Appointment;

  @Prop({ default: '' }) readonly id!: string;

  @Prop({ default: '' }) readonly weekday!: string;

  @Prop({ default: false }) readonly isHotair!: boolean;

  @Prop({ default: false }) readonly isHotair1!: boolean;

  @Prop({ default: false }) readonly isHotair2!: boolean;

  @Prop({ default: false }) readonly isHotair3!: boolean;

  @Prop({ default: false }) readonly isHotair4!: boolean;

  @Prop({ default: false }) readonly isUltrasonic!: boolean;

  @Prop({ default: false }) readonly isUltrasonic1!: boolean;

  @Prop({ default: false }) readonly isUltrasonic2!: boolean;

  @Prop({ default: false }) readonly isUltrasonic3!: boolean;

  @Prop({ default: false }) readonly isUltrasonic4!: boolean;

  @Prop({ default: false }) readonly isElectric!: boolean;

  @Prop({ default: false }) readonly isElectric1!: boolean;

  @Prop({ default: false }) readonly isElectric2!: boolean;

  @Prop({ default: false }) readonly isElectric3!: boolean;

  @Prop({ default: false }) readonly isElectric4!: boolean;

  @Prop() readonly isSingleApp!: boolean;

  @Prop() readonly reqOnePatient!: boolean;

  store = getModule(Store);

  public dialogIsOpen = false;

  public patientTextfield = this.patient;

  public patientTextField1 = this.patient1;

  public patientTextField2 = this.patient2;

  public patientTextField3 = this.patient3;

  public patientTextField4 = this.patient4;

  public startTimeSelect = this.startTime;

  public startTimeSelect1 = this.startTime1;

  public startTimeSelect2 = this.startTime2;

  public startTimeSelect3 = this.startTime3;

  public startTimeSelect4 = this.startTime4;

  public endTimeSelect = this.endTime;

  public endTimeSelect1 = this.endTime1;

  public endTimeSelect2 = this.endTime2;

  public endTimeSelect3 = this.endTime3;

  public endTimeSelect4 = this.endTime4;

  public commentTextfield = this.comment;

  public commentTextfield1 = this.comment1;

  public commentTextfield2 = this.comment2;

  public commentTextfield3 = this.comment3;

  public commentTextfield4 = this.comment4;

  public isExceptionField = !!this.isException;

  public isHotairField = !!this.isHotair;

  public isHotairField1 = !!this.isHotair1;

  public isHotairField2 = !!this.isHotair2;

  public isHotairField3 = !!this.isHotair3;

  public isHotairField4 = !!this.isHotair4;

  public isUltrasonicField = !!this.isUltrasonic;

  public isUltrasonicField1 = !!this.isUltrasonic1;

  public isUltrasonicField2 = !!this.isUltrasonic2;

  public isUltrasonicField3 = !!this.isUltrasonic3;

  public isUltrasonicField4 = !!this.isUltrasonic4;

  public isElectricField = !!this.isElectric;

  public isElectricField1 = !!this.isElectric1;

  public isElectricField2 = !!this.isElectric2;

  public isElectricField3 = !!this.isElectric3;

  public isElectricField4 = !!this.isElectric4;

  public showReplacementPatient1= true;

  public showReplacementPatient2= false;

  public showReplacementPatient3= false;

  public showReplacementPatient4= false;

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
    }
    if (this.patientTextfield !== null) {
      if ((this.appointment as AppointmentSeries).startTime) {
        // eslint-disable-next-line
        const patientKey = this.patientTextField1 + ';'
          // eslint-disable-next-line
          + this.startTimeSelect1 + ';' + this.endTimeSelect1 + ';' + this.commentTextfield1 + ';' + (this.isHotairField1 ? 'true' : 'false') + ';' + (this.isUltrasonicField1 ? 'true' : 'false') + ';' + (this.isElectricField1 ? 'true' : 'false') + ';' +
          this.patientTextField2 + ';'
          // eslint-disable-next-line
          + this.startTimeSelect2 + ';' + this.endTimeSelect2 + ';' + this.commentTextfield2 + ';' + (this.isHotairField2 ? 'true' : 'false') + ';' + (this.isUltrasonicField2 ? 'true' : 'false') + ';' + (this.isElectricField2 ? 'true' : 'false') + ';' +
          this.patientTextField3 + ';'
          // eslint-disable-next-line
          + this.startTimeSelect3 + ';' + this.endTimeSelect3 + ';' + this.commentTextfield3 + ';' + (this.isHotairField3 ? 'true' : 'false') + ';' + (this.isUltrasonicField3 ? 'true' : 'false') + ';' + (this.isElectricField3 ? 'true' : 'false') + ';' +
          this.patientTextField4 + ';'
          // eslint-disable-next-line
          + this.startTimeSelect4 + ';' + this.endTimeSelect4 + ';' + this.commentTextfield4 + ';' + (this.isHotairField4 ? 'true' : 'false') + ';' + (this.isUltrasonicField4 ? 'true' : 'false') + ';' + (this.isElectricField4 ? 'true' : 'false');
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
          // speichern Serien Termin
          if (this.patientTextField1 !== '') {
            this.addRepAppointment(1);
          }
          if (this.patientTextField2 !== '') {
            this.addRepAppointment(2);
          }
          if (this.patientTextField3 !== '') {
            this.addRepAppointment(3);
          }
          if (this.patientTextField4 !== '') {
            this.addRepAppointment(4);
          }
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

  public addRepAppointment(number: number): void {
    let patient;
    let startTimeSelect;
    let endTimeSelect;
    let commentTextfield;
    let isHotairField;
    let isUltrasonicField;
    let isElectricField;
    switch (number) {
      case 1:
        patient = this.patientTextField1;
        startTimeSelect = this.startTimeSelect1;
        endTimeSelect = this.endTimeSelect1;
        commentTextfield = this.commentTextfield1;
        isHotairField = this.isHotairField1;
        isUltrasonicField = this.isUltrasonicField1;
        isElectricField = this.isElectricField1;
        break;
      case 2:
        patient = this.patientTextField2;
        startTimeSelect = this.startTimeSelect2;
        endTimeSelect = this.endTimeSelect2;
        commentTextfield = this.commentTextfield2;
        isHotairField = this.isHotairField2;
        isUltrasonicField = this.isUltrasonicField2;
        isElectricField = this.isElectricField2;
        break;
      case 3:
        patient = this.patientTextField3;
        startTimeSelect = this.startTimeSelect3;
        endTimeSelect = this.endTimeSelect3;
        commentTextfield = this.commentTextfield3;
        isHotairField = this.isHotairField3;
        isUltrasonicField = this.isUltrasonicField3;
        isElectricField = this.isElectricField3;
        break;
      case 4:
        patient = this.patientTextField4;
        startTimeSelect = this.startTimeSelect4;
        endTimeSelect = this.endTimeSelect4;
        commentTextfield = this.commentTextfield4;
        isHotairField = this.isHotairField4;
        isUltrasonicField = this.isUltrasonicField4;
        isElectricField = this.isElectricField4;
        break;
      default:
        console.error(`Invalid number parameter: ${number}`);
        return;
    }

    this.$emit('repAppointmentAdded', {
      [`patient${number}`]: patient,
      [`therapist${number}`]: this.therapist,
      [`therapistID${number}`]: this.therapistID,
      [`startTime${number}`]: startTimeSelect,
      [`endTime${number}`]: endTimeSelect,
      [`comment${number}`]: commentTextfield,
      [`isHotair${number}`]: isHotairField,
      [`isUltrasonic${number}`]: isUltrasonicField,
      [`isElectric${number}`]: isElectricField,
    });
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

  public deleteReplacementAppointment(number: number): void {
    if (number === 1) {
    this.patientTextField1 = '';
    this.commentTextfield1 = '';
    this.startTimeSelect1 = this.startTimeSelect;
    this.endTimeSelect1 = this.endTimeSelect;
    this.isHotairField1 = false;
    this.isUltrasonicField1 = false;
    this.isElectricField1 = false;
    } else if (number === 2) {
    this.patientTextField2 = '';
    this.commentTextfield2 = '';
    this.startTimeSelect2 = this.startTimeSelect;
    this.endTimeSelect2 = this.endTimeSelect;
    this.isHotairField2 = false;
    this.isUltrasonicField2 = false;
    this.isElectricField2 = false;
    } else if (number === 3) {
    this.patientTextField3 = '';
    this.commentTextfield3 = '';
    this.startTimeSelect3 = this.startTimeSelect;
    this.endTimeSelect3 = this.endTimeSelect;
    this.isHotairField3 = false;
    this.isUltrasonicField3 = false;
    this.isElectricField3 = false;
    } else if (number === 4) {
    this.patientTextField4 = '';
    this.commentTextfield4 = '';
    this.startTimeSelect4 = this.startTimeSelect;
    this.endTimeSelect4 = this.endTimeSelect;
    this.isHotairField4 = false;
    this.isUltrasonicField4 = false;
    this.isElectricField4 = false;
    }
  }

  toggleReplacementPatients(patientNumber) {
      // Set all replacement patients to hidden by default
      this.showReplacementPatient1 = false;
      this.showReplacementPatient2 = false;
      this.showReplacementPatient3 = false;
      this.showReplacementPatient4 = false;

      // Show the selected replacement patient
      switch (patientNumber) {
        case 0:
          this.showReplacementPatient1 = true;
          this.showReplacementPatient2 = true;
          this.showReplacementPatient3 = true;
          this.showReplacementPatient4 = true;
          break;
        case 1:
          this.showReplacementPatient1 = true;
          break;
        case 2:
          this.showReplacementPatient2 = true;
          break;
        case 3:
          this.showReplacementPatient3 = true;
          break;
        case 4:
          this.showReplacementPatient4 = true;
          break;
        default:
          break;
      }
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
.is-hotair {
  background-color: rgb(228, 150, 5);
}

.is-electric {
  background-color: rgb(255, 61, 61);
}

.is-ultrasonic {
  background-color: lightskyblue;
}


</style>
