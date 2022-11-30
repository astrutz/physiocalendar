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
              v-for="header in headers"
              :key="header.value"
              :class="{
                'text-center': true,
                'hour-begin': rowIndex % 3 === 0,
                'cell-filled':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].startDate,
                'cell-bwo':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].isBWO,
                'cell-absence':
                  header.text !== '' && hasAbsenceInTime(header.id, rowIndex),
                'cell-saturday':
                  convertStringToDate(currentSingleDay).getDay() === 6 && !(typeof row[header.value] === 'string' &&
                  row[header.value].includes(':'))
              }"
              @click="
                row[header.value] === ''
                  ? openCreateDialog(header.value, header.id, row.startTime)
                  : {}
              "
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
                @appointmentChanged="changeAppointment($event)"
                @appointmentDeleted="deleteAppointment($event)"
                @exceptionChanged="changeException($event)"
                :patient="row[header.value].patient"
                :therapist="row[header.value].therapist"
                :therapistID="row[header.value].therapistID"
                :isException="row[header.value].startDate ? row[header.value].cancellations.includes(currentSingleDay) : false"
                :startTime="row.startTime"
                :appointment="row[header.value]"
                :date="currentSingleDay"
              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-dialog v-model="createDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ selectedAppointment.therapist }} - {{ currentSingleDay }} -
          {{ selectedAppointment.startTime }}
        </v-card-title>

        <v-card-text class="pt-5">
          <v-text-field
            label="Name des Patienten"
            v-model="inputFields.patientTextfield"
            @input="searchAppointmentsForPatient($event)"
            clearable
          ></v-text-field>

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
                startTime: selectedAppointment.startTime,
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
import Backup from '@/class/Backup';
import Dateconversions from '@/class/Dateconversions';
import { Time } from '@/class/Enums';
import SingleAppointment from '@/class/SingleAppointment';
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
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

  inputFields = {
    patientTextfield: '',
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

  private headers: { text: string, value: string, id: string, absences: Absence[], align: string }[] = [
    {
      text: '', value: 'startTime', id: '', absences: [], align: '',
    },
  ];

  private rows: {
    [key: string]: string | Time | SingleAppointment | AppointmentSeries | Absence[]
  }[] = [{ startTimeString: '' }];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('currentSingleDay')
  currentSingleDayChanged(): void {
    this.createHeaders();
    this.createRows();
    this.hash = uuidv4();
  }

  @Watch('localBackup')
  localBackupChanged(): void {
    this.createHeaders();
    this.createRows();
    this.hash = uuidv4();
  }

  mounted(): void {
    this.createHeaders();
    this.createRows();
    this.hash = uuidv4();
  }

  createHeaders(): void {
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
        align: 'center',
      }));
      this.headers = [{
        text: '', value: 'startTime', id: '', absences: [new Absence('a', Time['7:00'], Time['7:00'])], align: '',
      }].concat(therapistHeaders);
    }
  }

  createRows(): void {
    type TableRow = {
      [key: string]: string | Time | SingleAppointment | AppointmentSeries
    }

    const startTimes = Object.values(Time).filter((startTime): startTime is string => startTime.toString().includes(':'));
    const emptyRows = startTimes.map((startTime) => ({
      startTimeString: startTime.toString(),
      startTime: startTime as unknown as Time,
    }));

    this.rows = emptyRows.map((row) => {
      const newRow: TableRow = {
        startTimeString: row.startTimeString,
        startTime: row.startTime,
      };
      this.headers.forEach((header) => {
        if (header.text !== '') {
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
      return newRow;
    });
  }

  openCreateDialog(therapist: string, therapistID: string, startTime: string): void {
    this.selectedAppointment.therapist = therapist;
    this.selectedAppointment.therapistID = therapistID;
    this.selectedAppointment.startTime = startTime;
    this.createDialog = true;
  }

  resetInputs(): void {
    this.inputFields = {
      patientTextfield: '',
    };

    this.selectedAppointment = {
      therapist: '',
      therapistID: '',
      startTime: '7:00',
      day: this.currentSingleDay,
    };

    this.appointmentsForPatient = [];
  }

  searchAppointmentsForPatient(patient: string): void {
    if (this.localBackup) {
      let appointments: Appointment[] = this.localBackup.daylist.getSingleAppointmentsByPatient(patient);
      appointments = appointments.concat(this.localBackup.masterlist.getAppointmentSeriesByPatient(patient));
      this.appointmentsForPatient = appointments;
    }
  }

  addAppointment(
    event: { therapist: string, therapistID: string, patient: string, startTime: string },
  ): void {
    const appointment = new SingleAppointment(
      event.therapist,
      event.therapistID,
      event.patient,
      event.startTime as unknown as Time,
      Dateconversions.convertReadableStringToDate(this.currentSingleDay),
    );
    if (this.localBackup) {
      this.store.addSingleAppointment(appointment);
    }
    this.resetInputs();
  }

  changeAppointment(
    event: { therapist: string, therapistID: string, patient: string, startTime: string },
  ): void {
    const appointment = new SingleAppointment(
      event.therapist,
      event.therapistID,
      event.patient,
      event.startTime as unknown as Time,
      Dateconversions.convertReadableStringToDate(this.currentSingleDay),
    );
    if (this.localBackup) {
      this.store.changeSingleAppointment(appointment);
    }
  }

  deleteAppointment(
    event: { patient: string, therapist: string, therapistID: string, startTime: string },
  ): void {
    if (this.localBackup) {
      const appointment = new SingleAppointment(
        event.therapist,
        event.therapistID,
        event.patient,
        event.startTime as unknown as Time,
        Dateconversions.convertReadableStringToDate(this.currentSingleDay),
      );
      this.store.deleteSingleAppointment(appointment);
    }
  }

  changeException(event: { isException: boolean, appointment: AppointmentSeries }): void {
    if (this.localBackup) {
      if (event.isException) {
        this.store.addCancellation({ date: this.currentSingleDay, appointment: event.appointment });
      } else {
        this.store.removeCancellation({ date: this.currentSingleDay, appointment: event.appointment });
      }
    }
  }

  hasAbsenceInTime(therapistID: string, rowIndex: number): boolean {
    const therapist = this.headers.find((header) => header.id === therapistID);
    let hasAbsence = false;
    if (therapist) {
      therapist.absences.forEach((abs) => {
        if (parseInt(Time[abs.start], 10) <= rowIndex && parseInt(Time[abs.end], 10) >= rowIndex + 1) {
          hasAbsence = true;
        }
      });
    }
    return hasAbsence;
  }

  saveAbsences(event: { absences: [{ start: string, end: string }], therapistID: string }): void {
    if (this.localBackup) {
      const absences = event.absences.map(
        (abs) => new Absence(this.currentSingleDay, abs.start as unknown as Time, abs.end as unknown as Time),
      );
      this.store.setAbsencesForTherapistForDay({ absences, therapistID: event.therapistID.slice(), day: this.currentSingleDay });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  convertStringToDate(date: string) : Date {
    return Dateconversions.convertReadableStringToDate(date);
  }

  // eslint-disable-next-line class-methods-use-this
  convertDateToString(date: Date): string {
    return Dateconversions.convertDateToReadableString(date);
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
