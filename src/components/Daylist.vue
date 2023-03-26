<template>
  <div v-if="localBackup !== null">
    <v-simple-table style="margin-top: 16px" dense>
      <template v-slot:default>
        <thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header.value"
              class="text-center text-subtitle-2"
            >
              <span v-if="header.text === ''">{{ header.text }}</span>
              <DaylistHeader
                v-else
                :therapist="header.text"
                :therapistID="header.id"
                :head="header"
                :absences="
                  header.absences.filter((abs) => abs.day.includes('.'))
                "
                :masterlistAbsences="
                  header.absences.filter((abs) => !abs.day.includes('.'))
                "
                :exceptions="header.exceptions"
                :date="currentSingleDay"
                :key="`${hash}-${header.id}`"
                @absencesChanged="saveAbsences($event)"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="row.name">
            <td
              v-for="header in headers.filter(header => header === '' || row[header.value] != undefined)"
              :key="header.value"
              :rowspan="calculateRowspan(row[header.value])"
              :class="{
                'text-center': true,
                'hour-begin': rowIndex % 6 === 0,
                'cell-filled':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].startDate,
                'cell-bwo':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].isBWO,
                'cell-hotair':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].isHotair,
                'cell-ultrasonic':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].isUltrasonic,
                'cell-electric':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].isElectric,
                'cell-absence':
                  header.text !== '' && hasAbsenceInTime(header.id, rowIndex),
                'cell-saturday':
                  convertStringToDate(currentSingleDay).getDay() === 6 && !(typeof row[header.value] === 'string' &&
                  row[header.value].includes(':'))
              }"
              @click="openCreateDialog(header.value, header.id, row.startTime)"
            >
              <span
                v-if="
                  typeof row[header.value] === 'string' &&
                  row[header.value].includes(':')
                "
                >{{ row[header.value] }}</span
              >
              <div
                v-else-if="row[header.value] === ''"
                class="create-appointment"
                @click="openCreateDialog(header.value, header.id, row.startTime)"
              ></div>
              <DaylistElement
                v-else-if="row[header.value] && row[header.value].patient"
                :key="`${hash}-${row[header.value].therapistID}-${row.startTime}`"
                @appointmentAdded="addAppointment($event)"
                @repAppointmentAdded="addRepAppointment($event)"
                @appointmentChanged="changeAppointment($event)"
                @appointmentDeleted="deleteAppointment($event)"
                @exceptionAdded="addException($event)"
                @exceptionChanged="changeException($event)"
                @exceptionDeleted="deleteException($event)"
                :patient="row[header.value].patient"
                :id="row[header.value].id"
                :therapist="row[header.value].therapist"
                :therapistID="row[header.value].therapistID"
                :isException="row[header.value].startDate
                 ? row[header.value].cancellations.some((c) => c.date === currentSingleDay) : false"
                :isHotair="row[header.value].startDate ? false : row[header.value].isHotair"
                :isUltrasonic="row[header.value].startDate ? false : row[header.value].isUltrasonic"
                :isElectric="row[header.value].startDate ? false : row[header.value].isElectric"
                :startTime="row.startTime"
                :endTime="row[header.value].endTime"
                :patient1="row[header.value].startDate ? getPatient(row[header.value].cancellations,1) : ''"
                :startTime1="row[header.value].startDate ? getStartTime(row[header.value].cancellations,1) : ''"
                :endTime1="row[header.value].startDate ? getEndTime(row[header.value].cancellations,1) : ''"
                :comment1="row[header.value].startDate ? getComment(row[header.value].cancellations,1) : ''"
                :isHotair1="getIsHotair(row[header.value].cancellations,1) === 'true' ? true : false"
                :isUltrasonic1="getIsUltrasonic(row[header.value].cancellations,1) === 'true' ? true : false"
                :isElectric1="getIsElectric(row[header.value].cancellations,1) === 'true' ? true : false"
                :patient2="row[header.value].startDate ? getPatient(row[header.value].cancellations,2) : ''"
                :startTime2="row[header.value].startDate ? getStartTime(row[header.value].cancellations,2) : ''"
                :endTime2="row[header.value].startDate ? getEndTime(row[header.value].cancellations,2) : ''"
                :comment2="row[header.value].startDate ? getComment(row[header.value].cancellations,2) : ''"
                :isHotair2="getIsHotair(row[header.value].cancellations,2) === 'true' ? true : false"
                :isUltrasonic2="getIsUltrasonic(row[header.value].cancellations,2) === 'true' ? true : false"
                :isElectric2="getIsElectric(row[header.value].cancellations,2) === 'true' ? true : false"
                :patient3="row[header.value].startDate ? getPatient(row[header.value].cancellations,3) : ''"
                :startTime3="row[header.value].startDate ? getStartTime(row[header.value].cancellations,3) : ''"
                :endTime3="row[header.value].startDate ? getEndTime(row[header.value].cancellations,3) : ''"
                :comment3="row[header.value].startDate ? getComment(row[header.value].cancellations,3) : ''"
                :isHotair3="getIsHotair(row[header.value].cancellations,3) === 'true' ? true : false"
                :isUltrasonic3="getIsUltrasonic(row[header.value].cancellations,3) === 'true' ? true : false"
                :isElectric3="getIsElectric(row[header.value].cancellations,3) === 'true' ? true : false"
                :patient4="row[header.value].startDate ? getPatient(row[header.value].cancellations,4) : ''"
                :startTime4="row[header.value].startDate ? getStartTime(row[header.value].cancellations,4) : ''"
                :endTime4="row[header.value].startDate ? getEndTime(row[header.value].cancellations,4) : ''"
                :comment4="row[header.value].startDate ? getComment(row[header.value].cancellations,4) : ''"
                :isHotair4="getIsHotair(row[header.value].cancellations,4) === 'true' ? true : false"
                :isUltrasonic4="getIsUltrasonic(row[header.value].cancellations,4) === 'true' ? true : false"
                :isElectric4="getIsElectric(row[header.value].cancellations,4) === 'true' ? true : false"
                :reqOnePatient="row[header.value].cancellations ? true : false"
                :isSingleApp="row[header.value] && row[header.value].patient && !row[header.value].startDate"
                :appointment="row[header.value]"
                :date="row[header.value].startDate ? `seit ${convertDateToString(row[header.value].startDate)}` : currentSingleDay"
                :weekday="weekday"

              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-dialog v-model="createDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ selectedAppointment.therapist }} - {{ weekday }} {{ currentSingleDay }} -
          {{ selectedAppointment.startTime }}
        </v-card-title>

        <v-card-text class="pt-5">
          <v-combobox
            v-model="inputFields.patientTextfield"
            @input="searchAppointmentsForPatient($event)"
            :loading="patientsLoading"
            :items="foundPatients"
            :search-input.sync="searchValue"
            class="mb-4 mt-0"
            flat
            hide-no-data
            hide-details
            clearable
            label="Name des Patienten"
          ></v-combobox>

          <v-select
          :items="getAllTimes()"
          label="Start um"
          v-model="inputFields.startTimeSelect"
          ></v-select>

          <v-select
          :items="getAllTimes()"
          label="Ende um"
          v-model="inputFields.endTimeSelect"
          ></v-select>

          <v-text-field
            label="Sonstige Bemerkungen"
            v-model="inputFields.commentTextfield"
            clearable
          ></v-text-field>

          <v-row>
            <v-col>
              <v-checkbox
                label="Heißluft"
                v-model="inputFields.isHotairField"
              ></v-checkbox>
            </v-col>
            <v-col>
              <v-checkbox
                label="Ultraschall"
                v-model="inputFields.isUltrasonicField"
              ></v-checkbox>
            </v-col>
            <v-col>
              <v-checkbox
                label="Elektro"
                v-model="inputFields.isElectricField"
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-alert v-if="appointmentsForPatient.length > 0" type="info">
            Unter diesem Namen wurden weitere Termine gefunden:
            <div
              v-for="appointment in appointmentsForPatient"
            :key="`${appointment.therapistID}-${appointment.startTime}-${appointment.weekday}`"
            >
              {{
                appointment.weekday
                  ? appointment.weekday + "s"
                  : convertDateToString(appointment.date)
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
              resetInputs();
              createDialog = false;
            "
          >
            Abbrechen
          </v-btn>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            button
            @click="
              addAppointment({
                therapist: selectedAppointment.therapist,
                therapistID: selectedAppointment.therapistID,
                patient: inputFields.patientTextfield,
                startTime: inputFields.startTimeSelect,
                endTime: inputFields.endTimeSelect,
                comment: inputFields.commentTextfield,
                id: '',
                isHotair: inputFields.isHotairField,
                isUltrasonic: inputFields.isUltrasonicField,
                isElectric: inputFields.isElectricField,
              });
              createDialog = false;
            "
          >
            Speichern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <div v-else>wird geladen</div>
</template>

<script lang="ts">
import { v4 as uuidv4 } from 'uuid';
import Appointment from '@/class/Appointment';
import Absence from '@/class/Absence';
import AppointmentSeries from '@/class/AppointmentSeries';
import Cancellation from '@/class/Cancellation';
import Backup from '@/class/Backup';
import Dateconversions from '@/class/Dateconversions';
import { Time } from '@/class/Enums';
import SingleAppointment from '@/class/SingleAppointment';
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Util from '@/class/Util';
import Exception from '@/class/Exception';
import Store from '../store/backup';
import DaylistElement from './DaylistElement.vue';
import DaylistHeader from './DaylistHeader.vue';

@Component({
  components: {
    DaylistElement,
    DaylistHeader,
  },
})

export default class Daylist extends Vue {
  @Prop() readonly currentSingleDay!: string;

  createDialog = false;

  weekday = '';

  inputFields = {
    patientTextfield: '',
    startTimeSelect: '',
    endTimeSelect: '',
    commentTextfield: '',
    isHotairField: false,
    isUltrasonicField: false,
    isElectricField: false,
  }

  selectedAppointment = {
    therapist: '',
    therapistID: '',
    startTime: '7:00',
    day: this.currentSingleDay,
  };

  store = getModule(Store);

  appointmentsForPatient: Appointment[] = [];

  hash = uuidv4();

  private headers: { text: string, value: string, id: string, absences: Absence[], exceptions: Exception[], align: string }[] = [
    {
      text: '', value: 'startTime', id: '', absences: [], exceptions: [], align: '',
    },
  ];

  private rows: {
    [key: string]: string | Time | SingleAppointment | AppointmentSeries | Absence[]
  }[] = [{ startTimeString: '' }];

  private patientsLoading = false;

  private searchValue = '';

  private patient1 = '';

  private startTime1 = '';

  private endTime1 = '';

  private comment1 = '';

  private foundPatients : string[] = [];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('currentSingleDay')
  currentSingleDayChanged(): void {
    this.createHeaders();
    this.createRows();
    this.hash = uuidv4();
    this.weekday = Dateconversions.getWeekdayStringForDate(Dateconversions.convertReadableStringToDate(this.currentSingleDay));
  }

  @Watch('localBackup')
  localBackupChanged(): void {
    this.createHeaders();
    this.createRows();
    this.hash = uuidv4();
  }

  @Watch('searchValue')
  searchValueChanged(val: string | undefined): boolean {
    this.foundPatients = [];
    this.searchPatients(val);
    this.inputFields.patientTextfield = val || this.inputFields.patientTextfield;
    return val !== this.inputFields.patientTextfield;
  }

  mounted(): void {
    this.createHeaders();
    this.createRows();
    this.hash = uuidv4();
    this.weekday = Dateconversions.getWeekdayStringForDate(Dateconversions.convertReadableStringToDate(this.currentSingleDay));
  }

  private createHeaders(): void {
    if (this.localBackup !== null) {
      this.headers = [];
      const currentSingleDate = Dateconversions.convertReadableStringToDate(this.currentSingleDay);
      const therapistHeaders = this.localBackup.therapists.filter(
        (therapist) => therapist.activeSince < currentSingleDate && therapist.activeUntil > currentSingleDate,
      ).map((therapist) => ({
        text: therapist.name,
        value: therapist.name,
        id: therapist.id,
        absences: therapist.absences.filter(
          (abs) => abs.day === this.currentSingleDay || abs.day === Dateconversions.getWeekdayForDate(currentSingleDate),
        ),
        exceptions: therapist.exceptions.filter(
          (exc) => exc.day === this.currentSingleDay,
        ),
        align: 'center',
      }));
      this.headers = [{
        text: '',
        value: 'startTime',
        id: '',
        absences: [new Absence('a', Time['7:00'], Time['7:00'])],
        exceptions: [new Exception('a', Time['7:00'], Time['7:00'])],
        align: '',
      }].concat(therapistHeaders);
    }
  }

  private createRows(): void {
    type TableRow = {
      [key: string]: string | Time | SingleAppointment | AppointmentSeries
    }

    const startTimes = Object.values(Time).filter((startTime): startTime is string => startTime.toString().includes(':'));
    const emptyRows = startTimes.map((startTime) => ({
      startTimeString: startTime.toString(),
      startTime: startTime as unknown as Time,
    }));

    this.rows = [];

    emptyRows.forEach((row) => {
      const newRow: TableRow = {
        startTimeString: row.startTimeString,
        startTime: row.startTime,
      };
      this.headers.forEach((header) => {
        if (header.text !== '' && !this.hasOngoingAppointments(header.value, row.startTime)) {
          const singleAppointment = this.localBackup?.daylist.searchAppointment(
            header.id, this.currentSingleDay, row.startTime as Time,
          );
          if (singleAppointment !== undefined) {
            newRow[header.text] = singleAppointment;
          } else {
            const currentSingleDate = Dateconversions.convertReadableStringToDate(this.currentSingleDay);
            const weekday = Dateconversions.getWeekdayForDate(currentSingleDate);
            if (weekday) {
              const masterAppointment = this.localBackup?.masterlist.searchAppointmentForDaylist(
                header.id, weekday, row.startTime as Time, currentSingleDate,
              );
              newRow[header.text] = masterAppointment || '';
            } else {
              newRow[header.text] = '';
            }
          }
        }
      });
      this.rows.push(newRow);
    });
  }

  private hasOngoingAppointments(therapist : string, time: Time) : boolean {
    return this.rows.some((row) => {
      if (row[therapist] !== '') {
        try {
          const appointment = (row[therapist] as Appointment);
          if (Time[appointment.startTime] < Time[time] && Time[appointment.endTime] > Time[time]) {
            return true;
          }
        } catch (err) {
          return false;
        }
      }
      return false;
    });
  }

  private openCreateDialog(therapist: string, therapistID: string, startTime: string): void {
    this.selectedAppointment.therapist = therapist;
    this.selectedAppointment.therapistID = therapistID;
    this.selectedAppointment.startTime = startTime;
    const times = this.getAllTimes();
    const i = times.indexOf(startTime);
    this.inputFields.startTimeSelect = startTime;
    this.inputFields.endTimeSelect = i + 2 < times.length - 1 ? times[i + 2] : times[times.length - 1];
    this.createDialog = true;
  }

  private resetInputs(): void {
    this.inputFields = {
      patientTextfield: '',
      startTimeSelect: '',
      endTimeSelect: '',
      commentTextfield: '',
      isHotairField: false,
      isUltrasonicField: false,
      isElectricField: false,
    };

    this.selectedAppointment = {
      therapist: '',
      therapistID: '',
      startTime: '7:00',
      day: this.currentSingleDay,
    };

    this.appointmentsForPatient = [];
  }

  private searchAppointmentsForPatient(patient: string): void {
    if (this.localBackup) {
      let appointments: Appointment[] = this.localBackup.daylist.getSingleAppointmentsByPatient(patient);
      appointments = appointments.concat(this.localBackup.masterlist.getAppointmentSeriesByPatient(patient));
      appointments = appointments.concat(this.localBackup.masterlist.getReplacementsByPatient(patient));
      this.appointmentsForPatient = appointments;
    }
  }

  public addAppointment(
    event: {
      therapist: string, therapistID: string, patient: string, startTime: string, endTime: string, comment: string, id: string,
      isHotair: boolean, isUltrasonic: boolean, isElectric: boolean,
    },
  ): void {
    const appointment = new SingleAppointment(
      event.therapist,
      event.therapistID,
      event.patient,
      event.startTime as unknown as Time,
      event.endTime as unknown as Time,
      event.comment,
      Dateconversions.convertReadableStringToDate(this.currentSingleDay),
      event.isHotair,
      event.isUltrasonic,
      event.isElectric,
    );
    if (this.localBackup) {
      this.store.addSingleAppointment(appointment);
    }
    this.resetInputs();
  }

  private addRepAppointment(
    event: {
      therapist1: string, therapistID1: string, patient1: string, startTime1: string, endTime1: string, comment1: string, id1: string,
      isHotair1: boolean, isUltrasonic1: boolean, isElectric1: boolean,
    },
  ): void {
    const appointment = new SingleAppointment(
      event.therapist1,
      event.therapistID1,
      event.patient1,
      event.startTime1 as unknown as Time,
      event.endTime1 as unknown as Time,
      event.comment1,
      Dateconversions.convertReadableStringToDate(this.currentSingleDay),
      event.isHotair1,
      event.isUltrasonic1,
      event.isElectric1,
    );
    if (this.localBackup) {
      console.log(appointment);
      this.store.addSingleAppointment(appointment);
    }
  }

  private changeAppointment(
    event: {
      therapist: string, therapistID: string, patient: string, startTime: string, endTime: string, comment: string, id: string,
      isHotair: boolean, isUltrasonic: boolean, isElectric: boolean,
    },
  ): void {
    const appointment = new SingleAppointment(
      event.therapist,
      event.therapistID,
      event.patient,
      event.startTime as unknown as Time,
      event.endTime as unknown as Time,
      event.comment,
      Dateconversions.convertReadableStringToDate(this.currentSingleDay),
      event.isHotair,
      event.isUltrasonic,
      event.isElectric,
      event.id,
    );
    console.log('speichern einzel Termin');
    console.log(appointment);
    if (this.localBackup) {
      // this.patient1 = this.getPatient1(appointment.cancellations);
      // this.startTime1 = this.getStartTime1(appointment.cancellations);
      // this.endTime1 = this.getEndTime1(appointment.cancellations);
      // this.comment1 = this.getComment1(appointment.cancellations);
      this.store.changeSingleAppointment(appointment);
    }
  }

  private deleteAppointment(
    event: {
      therapist: string, therapistID: string, patient: string, startTime: string, endTime: string, comment: string, id: string,
      isHotair: boolean, isUltrasonic: boolean, isElectric: boolean,
    },
  ): void {
    if (this.localBackup) {
      const appointment = new SingleAppointment(
        event.therapist,
        event.therapistID,
        event.patient,
        event.startTime as unknown as Time,
        event.endTime as unknown as Time,
        event.comment,
        Dateconversions.convertReadableStringToDate(this.currentSingleDay),
        event.isHotair,
        event.isUltrasonic,
        event.isElectric,
        event.id,
      );
      this.store.deleteSingleAppointment(appointment);
    }
  }

  private addException(event: { isException: boolean, patient: string, appointment: AppointmentSeries }): void {
    if (this.localBackup) {
      this.store.addCancellation({
        date: this.currentSingleDay, patient: event.patient, appointment: event.appointment,
      });
      console.log(event.appointment);
    }
  }

  private changeException(event: { isException: boolean, patient: string, appointment: AppointmentSeries }): void {
    if (this.localBackup) {
      this.store.changeCancellation({
        date: this.currentSingleDay, patient: event.patient, appointment: event.appointment,
      });
    }
  }

  private deleteException(event: { isException: boolean, patient: string, appointment: AppointmentSeries }): void {
    if (this.localBackup) {
      this.store.deleteCancellation({ date: this.currentSingleDay, appointment: event.appointment });
    }
  }

  private getPatient(cancellations: Cancellation[], number: number): string {
    const cancellation = cancellations.find((c) => c.date === this.currentSingleDay);
    const arr = cancellation?.patient.split(';');
    if (arr) {
      switch (number) {
        case 1:
          return arr[0];
        case 2:
          return arr[7];
        case 3:
          return arr[14];
        case 4:
          return arr[21];
        default:
          return '';
      }
    }
    return '';
  }

  private getStartTime(cancellations: Cancellation[], number: number): string {
    const cancellation = cancellations.find((c) => c.date === this.currentSingleDay);
    const arr = cancellation?.patient.split(';');
    if (arr) {
      switch (number) {
        case 1:
          return arr[1];
        case 2:
          return arr[8];
        case 3:
          return arr[15];
        case 4:
          return arr[22];
        default:
          return '';
      }
    }
    return '';
  }

  private getEndTime(cancellations: Cancellation[], number: number): string {
    const cancellation = cancellations.find((c) => c.date === this.currentSingleDay);
    const arr = cancellation?.patient.split(';');
    if (arr) {
      switch (number) {
        case 1:
          return arr[2];
        case 2:
          return arr[9];
        case 3:
          return arr[16];
        case 4:
          return arr[23];
        default:
          return '';
      }
    }
    return '';
  }

  private getComment(cancellations: Cancellation[], number: number): string {
    const cancellation = cancellations.find((c) => c.date === this.currentSingleDay);
    const arr = cancellation?.patient.split(';');
    if (arr) {
      switch (number) {
        case 1:
          return arr[3];
        case 2:
          return arr[10];
        case 3:
          return arr[17];
        case 4:
          return arr[24];
        default:
          return '';
      }
    }
    return '';
  }

  private getIsHotair(cancellations: Cancellation[], number: number): string {
    const cancellation = cancellations.find((c) => c.date === this.currentSingleDay);
    const arr = cancellation?.patient.split(';');
    if (arr) {
      switch (number) {
        case 1:
          return arr[4];
        case 2:
          return arr[11];
        case 3:
          return arr[18];
        case 4:
          return arr[25];
        default:
          return '';
      }
    }
    return '';
  }

  private getIsUltrasonic(cancellations: Cancellation[], number: number): string {
    const cancellation = cancellations.find((c) => c.date === this.currentSingleDay);
    const arr = cancellation?.patient.split(';');
    if (arr) {
      switch (number) {
        case 1:
          return arr[5];
        case 2:
          return arr[12];
        case 3:
          return arr[19];
        case 4:
          return arr[26];
        default:
          return '';
      }
    }
    return '';
  }

  private getIsElectric(cancellations: Cancellation[], number: number): string {
    const cancellation = cancellations.find((c) => c.date === this.currentSingleDay);
    const arr = cancellation?.patient.split(';');
    if (arr) {
      switch (number) {
        case 1:
          return arr[6];
        case 2:
          return arr[13];
        case 3:
          return arr[20];
        case 4:
          return arr[27];
        default:
          return '';
      }
    }
    return '';
  }

  private hasAbsenceInTime(therapistID: string, rowIndex: number): boolean {
    const therapist = this.headers.find((header) => header.id === therapistID);
    let hasAbsence = false;
    if (therapist) {
      therapist.absences.forEach((abs) => {
        if (parseInt(Time[abs.start], 10) <= rowIndex && parseInt(Time[abs.end], 10) >= rowIndex + 1) {
          if (!therapist.exceptions.find(
            (exc) => parseInt(Time[exc.start], 10) <= rowIndex && parseInt(Time[exc.end], 10) >= rowIndex + 1,
          )) {
            hasAbsence = true;
          }
        } else if (abs.end.toString() === '20:50' && rowIndex === 83) {
          hasAbsence = true;
        }
      });
    }
    return hasAbsence;
  }

  private saveAbsences(event: { absences: [{ start: string, end: string }], masterlistAbsences: [{ start: string, end: string }],
    exceptions: [{ start: string, end: string }], therapistID: string }): void {
    if (this.localBackup) {
      const absences = event.absences.map(
        (abs) => new Absence(this.currentSingleDay, abs.start as unknown as Time, abs.end as unknown as Time),
      );
      this.store.setAbsencesForTherapistForDay({ absences, therapistID: event.therapistID.slice(), day: this.currentSingleDay });
      const exceptions = event.exceptions.map(
        (exc) => new Exception(this.currentSingleDay, exc.start as unknown as Time, exc.end as unknown as Time),
      );
      this.store.setExceptionsForTherapistForDay({ exceptions, therapistID: event.therapistID.slice(), day: this.currentSingleDay });
    }
  }

  private searchPatients(searchQuery : string | undefined) : void {
    if (searchQuery && searchQuery.length > 2 && this.localBackup) {
      this.patientsLoading = true;
      this.foundPatients = Util.searchPatientNames(this.localBackup, searchQuery);
      this.patientsLoading = false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private calculateRowspan(appointment : string | AppointmentSeries | SingleAppointment) : number {
    if (typeof appointment === 'string') {
      return 1;
    }
    return appointment.calculateLength();
  }

  // eslint-disable-next-line class-methods-use-this
  private convertStringToDate(date: string) : Date {
    return Dateconversions.convertReadableStringToDate(date);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertDateToString(date: Date): string {
    return Dateconversions.convertDateToReadableString(date);
  }

  // eslint-disable-next-line class-methods-use-this
  private getAllTimes(): string[] {
    return Dateconversions.getAllTimes();
  }
}

</script>

<style scoped>
th:first-child {
  border-left: 1px solid #2a2f79;
  border-right: 2px solid #2a2f79;
  border-top-left-radius: 15px;
}

th:last-child {
  border-top-right-radius: 15px;
}

tr:last-child td {
  border-bottom: 1px solid #2a2f79 !important;
}

tr:last-child td:first-child {
  border-bottom-left-radius: 15px;
}

tr:last-child td:last-child {
  border-bottom-right-radius: 15px;
}

th {
  border-top: 1px solid #2a2f79;
  border-right: 1px solid #2a2f79;
  padding-left: 0px !important;
  padding-right: 0px !important;
  color: black !important;
}

td {
  border-right: 1px solid #2a2f79;
  border-bottom: 1px solid #2a2f79;
  padding-left: 0px !important;
  padding-right: 0px !important;
  column-width: 300px;
  height: 24px !important;
}

td:hover {
  cursor: pointer;
  background-color: #b4b6d196 !important;
}

.cell-filled {
  background-color: lightgreen;
}

.cell-bwo {
  background-color: yellow;
}

.cell-hotair {
  background-color: rgb(228, 150, 5);
}

.cell-ultrasonic {
  background-color: lightskyblue;
}

.cell-electric {
  background-color: rgb(255, 61, 61);
}

.cell-absence {
  background-color: #6c7272;
}

.cell-absence:hover {
  background-color: #6c7272 !important;
  cursor: default;
}

.cell-saturday {
  background-color: #6c7272;
}

.cell-saturday:hover {
  background-color: #6c7272 !important;
  cursor: default;
}

.cell-saturday + .cell-absence {
  cursor: pointer !important;
  background-color: white !important;
}

.cell-saturday + .cell-absence:hover {
  background-color: #b4b6d196 !important;
}

tr:hover {
  background-color: white !important;
}

tr td:first-child {
  border-left: 1px solid #2a2f79;
  border-right: 2px solid #2a2f79;
  font-weight: bold;
}

tr td:first-child:hover {
  background-color: white !important;
  cursor: default;
}

tr th:first-child:hover {
  background-color: white !important;
  cursor: default;
}

th:hover {
  cursor: pointer;
  background-color: #9e9eaa96;
}

.hour-begin {
  border-top: 2px ridge #2a2f79;
}

.create-appointment {
  width: 100%;
  height: 100%;
}
</style>
