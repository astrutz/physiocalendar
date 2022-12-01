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
              <MasterlistHeader
                v-else
                :therapist="header.text"
                :therapistID="header.id"
                :head="header"
                :absences="header.absences"
                :date="currentWeekDay"
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
                'cell-bwo':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].isBWO,
                'cell-absence':
                  header.text !== '' && hasAbsenceInTime(header.id, rowIndex),
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
              <MasterlistElement
                v-else-if="row[header.value] && row[header.value].patient"
                :key="`${hash}-${row[header.value].therapistID}-${row.startTime}`"
                @appointmentAdded="addAppointment($event)"
                @appointmentChanged="changeAppointment($event)"
                @appointmentDeleted="deleteAppointment($event)"
                :patient="row[header.value].patient"
                :therapist="row[header.value].therapist"
                :therapistID="row[header.value].therapistID"
                :startTime="row.startTime"
                :appointment="row[header.value]"
                :day="currentWeekDay"
              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-dialog v-model="createDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ selectedAppointment.therapist }} -
          {{ currentWeekDay.toLowerCase() }}s - {{ selectedAppointment.startTime }}
        </v-card-title>

        <v-card-text class="pt-5">
          <v-text-field
            label="Name des Patienten"
            v-model="inputFields.patientTextfield"
            clearable
          ></v-text-field>
          <v-select
            :items="getAllTimes()"
            label="Endzeit"
            v-model="inputFields.endTimeSelect"
          ></v-select>
          <v-row class="pl-3">
            <v-checkbox
              label="Patient ist aus BWO"
              v-model="inputFields.isBWO"
              :value="inputFields.isBWO"
            ></v-checkbox>
          </v-row>
           <v-row class="pl-3 pr-3">
            <v-text-field
              label="Wöchentliches Interval"
              type="number"
              :rules="[v => (v > 0 && v % 1 === 0)]"
              v-model="inputFields.interval"
              :value="inputFields.interval"
            ></v-text-field>
          </v-row>
          <v-row class="pl-3">
            <v-menu
              v-model="inputFields.menuIsOpen"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="inputFields.startDateStringFormatted"
                  label="Startdatum"
                  persistent-hint
                  prepend-icon="mdi-calendar"
                  v-bind="attrs"
                  @blur="
                    inputFields.startDateString =
                      convertGermanToEnglishReadableString(
                        inputFields.startDateStringFormatted
                      )
                  "
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="inputFields.startDateString"
                :allowed-dates="
                  (dateVal) => {
                    return new Date(dateVal) >= new Date();
                  }
                "
                @input="
                  inputFields.menuIsOpen = false;
                  inputFields.startDate = getCombinedDate();
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
                {{ conflict.patient }} -
                {{ conflict.date.toLocaleDateString() }},
                {{ conflict.startTime }}
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
            :disabled="conflicts.length > 0"
            @click="
              addAppointment({
                therapist: selectedAppointment.therapist,
                therapistID: selectedAppointment.therapistID,
                patient: inputFields.patientTextfield,
                startTime: selectedAppointment.startTime,
                endTime: inputFields.endTimeSelect,
                interval: parseInt(inputFields.interval, 10),
                isBWO: inputFields.isBWO,
                startDate: getCombinedDate(),
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
import Absence from '@/class/Absence';
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
import MasterlistElement from './MasterlistElement.vue';
import MasterlistHeader from './MasterlistHeader.vue';

@Component({
  components: {
    MasterlistElement,
    MasterlistHeader,
  },
})

export default class Masterlist extends Vue {
  @Prop() readonly currentWeekDay!: Weekday;

  createDialog = false;

  inputFields = {
    patientTextfield: '',
    endTimeSelect: '',
    menuIsOpen: false,
    startDate: new Date(),
    interval: '1',
    isBWO: false,
    startDateString: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    startDateStringFormatted: Dateconversions.convertEnglishToGermanReadableString(
      new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    ),
  }

  selectedAppointment = {
    therapist: '',
    therapistID: '',
    startTime: '7:00',
    weekday: this.currentWeekDay,
  };

  private conflicts: SingleAppointment[] = [];

  hash = uuidv4();

  store = getModule(Store);

  private headers: { text: string, value: string, id: string, absences: Absence[] }[] = [
    {
      text: '', value: 'startTime', id: '', absences: [],
    },
  ];

  private rows: {
    [key: string]: string | Time | AppointmentSeries | Absence[]
  }[] = [{ startTimeString: '' }];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('currentWeekDay')
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

  @Watch('inputFields.startDateString')
  dateChanged(): void {
    this.getAppointmentConflicts();
    this.inputFields.startDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(this.inputFields.startDateString);
  }

  mounted(): void {
    this.createHeaders();
    this.createRows();
    this.hash = uuidv4();
  }

  createHeaders(): void {
    if (this.localBackup !== null) {
      const today = new Date();
      const therapistHeaders = this.localBackup.therapists.filter(
        (therapist) => therapist.activeSince < today && therapist.activeUntil > today,
      ).map((therapist) => ({
        text: therapist.name,
        value: therapist.name,
        id: therapist.id,
        absences: therapist.absences.filter((abs) => abs.day === this.currentWeekDay),
      }));
      this.headers = [{
        text: '', value: 'startTime', id: '', absences: [new Absence('a', Time['7:00'], Time['7:00'])],
      }].concat(therapistHeaders);
    }
  }

  createRows(): void {
    type TableRow = {
      [key: string]: string | Time | AppointmentSeries
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
          newRow[header.text] = this
            .localBackup?.masterlist.searchAppointment(header.id, this.currentWeekDay, row.startTime as Time) || '';
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
    this.getAppointmentConflicts();
  }

  getAppointmentConflicts(): void {
    if (this.localBackup) {
      this.conflicts = this.localBackup.daylist.getAppointmentConflicts(
        this.currentWeekDay,
        this.selectedAppointment.therapistID,
        this.selectedAppointment.startTime as unknown as Time,
        this.inputFields.startDate,
      );
    }
  }

  getCombinedDate(): Date {
    const timezoneOffsetInHours = new Date(`${this.inputFields.startDateString}T00:00:00.000Z`).getTimezoneOffset() * -1;
    const offsetSuffix = `${timezoneOffsetInHours < 0 ? '-' : '+'}0${Math.abs(timezoneOffsetInHours / 60)}:00`;
    return new Date(`${this.inputFields.startDateString}T04:00:00.000${offsetSuffix}`);
  }

  convertGermanToEnglishReadableString(): string {
    return Dateconversions.convertGermanToEnglishReadableString(this.inputFields.startDateStringFormatted);
  }

  resetInputs(): void {
    this.inputFields = {
      patientTextfield: '',
      endTimeSelect: '',
      menuIsOpen: false,
      interval: '1',
      isBWO: false,
      startDate: new Date(),
      startDateString: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
      startDateStringFormatted: Dateconversions.convertEnglishToGermanReadableString(
        new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
      ),
    };

    this.selectedAppointment = {
      therapist: '',
      therapistID: '',
      startTime: '7:00',
      weekday: this.currentWeekDay,
    };

    this.conflicts = [];
  }

  addAppointment(
    event: { therapist: string, therapistID: string, patient: string, startTime: string, endTime: string,
    startDate: Date, isBWO: boolean, interval: number },
  ): void {
    const appointment = new AppointmentSeries(
      event.therapist,
      event.therapistID,
      event.patient,
      event.startTime as unknown as Time,
      event.endTime as unknown as Time,
      this.currentWeekDay,
      event.interval,
      [],
      event.startDate,
      event.isBWO,
    );
    if (this.localBackup) {
      this.store.addAppointmentSeries(appointment);
    }
    this.resetInputs();
  }

  changeAppointment(
    event: {
      patient: string, therapist: string, therapistID: string, startTime: string, endTime: string,
      cancellations: string[], startDate: Date, isBWO: boolean, interval: number
    },
  ): void {
    const appointment = new AppointmentSeries(
      event.therapist,
      event.therapistID,
      event.patient,
      event.startTime as unknown as Time,
      event.endTime as unknown as Time,
      this.currentWeekDay,
      event.interval,
      event.cancellations,
      event.startDate,
      event.isBWO,
    );
    if (this.localBackup) {
      this.store.changeAppointmentSeries(appointment);
    }
  }

  deleteAppointment(
    event: {
      patient: string, therapist: string, therapistID: string, startTime: string, endTime: string,
      cancellations: string[], startDate: Date, isBWO: boolean, interval: number
    },
  ): void {
    if (this.localBackup) {
      const appointment = new AppointmentSeries(
        event.therapist,
        event.therapistID,
        event.patient,
        event.startTime as unknown as Time,
        event.endTime as unknown as Time,
        this.currentWeekDay,
        event.interval,
        event.cancellations,
        event.startDate,
        event.isBWO,
      );
      this.store.deleteAppointmentSeries(appointment);
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
        (abs) => new Absence(this.currentWeekDay, abs.start as unknown as Time, abs.end as unknown as Time),
      );
      this.store.setAbsencesForTherapistForDay({ absences, therapistID: event.therapistID.slice(), day: this.currentWeekDay });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getAllTimes(): string[] {
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
