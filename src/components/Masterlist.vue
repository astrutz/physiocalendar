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
              {{ header.text }}
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
              }"
              @click="
                row[header.value] === ''
                  ? openCreateDialog(header.value, row.time)
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
                @click="openCreateDialog(header.value, row.time)"
              ></div>
              <!-- TODO: Masterlist Element with only one global dialog -->
              <MasterlistElement
                v-else-if="row[header.value] && row[header.value].patient"
                @appointmentAdded="addAppointment($event)"
                @appointmentChanged="changeAppointment($event)"
                @appointmentDeleted="deleteAppointment($event)"
                :patient="row[header.value].patient"
                :therapist="row[header.value].therapist"
                :time="row.time"
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
          {{ currentWeekDay.toLowerCase() }}s - {{ selectedAppointment.time }}
        </v-card-title>

        <v-card-text class="pt-5">
          <v-text-field
            label="Name des Patienten"
            v-model="inputFields.patientTextfield"
            clearable
          ></v-text-field>
          <v-row class="pl-3">
            <v-checkbox
              label="Termin hat ein Ablaufdatum"
              v-model="inputFields.hasEnd"
            ></v-checkbox>
          </v-row>
          <v-row class="pl-3" v-if="inputFields.hasEnd">
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
                  v-model="inputFields.endDateStringFormatted"
                  label="Enddatum"
                  persistent-hint
                  prepend-icon="mdi-calendar"
                  v-bind="attrs"
                  @blur="
                    inputFields.endDateString =
                      convertGermanToEnglishReadableString(
                        inputFields.endDateStringFormatted
                      )
                  "
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="inputFields.endDateString"
                @input="
                  inputFields.menuIsOpen = false;
                  inputFields.endDate = getCombinedDate();
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
                {{ conflict.time }}
              </li>
            </ul>
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="error" text @click="createDialog = false">
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
                patient: inputFields.patientTextfield,
                time: selectedAppointment.time,
                hasEnd: inputFields.hasEnd,
                endDate: inputFields.hasEnd ? inputFields.endDate : null,
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

@Component({
  components: {
    MasterlistElement,
  },
})

export default class Masterlist extends Vue {
  @Prop() readonly currentWeekDay!: Weekday;

  createDialog = false;

  inputFields = {
    patientTextfield: '',
    hasEnd: false,
    menuIsOpen: false,
    endDate: new Date(),
    endDateString: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    endDateStringFormatted: Dateconversions.convertEnglishToGermanReadableString(
      new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    ),
  }

  selectedAppointment = {
    therapist: '',
    time: '7:00',
    weekday: this.currentWeekDay,
  };

  private conflicts: SingleAppointment[] = [];

  store = getModule(Store);

  private headers = [
    { text: '', value: 'time' },
  ];

  private rows: {
    [key: string]: string | Time | AppointmentSeries
  }[] = [{ timeString: '' }];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('currentWeekDay')
  currentSingleDayChanged(): void {
    this.createHeaders();
    this.createRows();
  }

  @Watch('localBackup')
  localBackupChanged(): void {
    this.createHeaders();
    this.createRows();
  }

  @Watch('inputFields.hasEnd')
  hasEndChanged(): void {
    this.getAppointmentConflicts();
  }

  @Watch('inputFields.endDateString')
  dateChanged(): void {
    this.getAppointmentConflicts();
    this.inputFields.endDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(this.inputFields.endDateString);
  }

  mounted(): void {
    this.createHeaders();
    this.createRows();
  }

  createHeaders(): void {
    if (this.localBackup !== null) {
      const today = new Date();
      const therapistHeaders = this.localBackup.therapists.filter(
        (therapist) => therapist.activeSince < today && therapist.activeUntil > today,
      ).map((therapist) => ({ text: therapist.name, value: therapist.name }));
      this.headers = [{ text: '', value: 'time' }].concat(therapistHeaders);
    }
  }

  createRows(): void {
    type TableRow = {
      [key: string]: string | Time | AppointmentSeries
    }

    const times = Object.values(Time).filter((time): time is string => time.toString().includes(':'));
    const emptyRows = times.map((time) => ({
      timeString: time.toString(),
      time: time as unknown as Time,
    }));

    this.rows = emptyRows.map((row) => {
      const newRow: TableRow = {
        timeString: row.timeString,
        time: row.time,
      };
      this.headers.forEach((header) => {
        if (header.text !== '') {
          newRow[header.text] = this
            .localBackup?.masterlist.searchAppointment(header.text, this.currentWeekDay, row.time as Time) || '';
        }
      });
      return newRow;
    });
  }

  openCreateDialog(therapist: string, time: string): void {
    this.getAppointmentConflicts();
    this.selectedAppointment.therapist = therapist;
    this.selectedAppointment.time = time;
    this.createDialog = true;
  }

  getAppointmentConflicts(): void {
    if (this.localBackup) {
      this.localBackup.daylist.getAppointmentConflicts(
        this.currentWeekDay,
        this.inputFields.hasEnd,
        this.selectedAppointment.therapist,
        this.inputFields.endDate,
        this.selectedAppointment.time as unknown as Time,
      );
    }
  }

  getCombinedDate(): Date {
    const timezoneOffsetInHours = new Date(`${this.inputFields.endDateString}T00:00:00.000Z`).getTimezoneOffset() * -1;
    const offsetSuffix = `${timezoneOffsetInHours < 0 ? '-' : '+'}0${Math.abs(timezoneOffsetInHours / 60)}:00`;
    return new Date(`${this.inputFields.endDateString}T15:00:00.000${offsetSuffix}`);
  }

  convertGermanToEnglishReadableString(): string {
    return Dateconversions.convertGermanToEnglishReadableString(this.inputFields.endDateStringFormatted);
  }

  resetInputs(): void {
    this.inputFields = {
      patientTextfield: '',
      hasEnd: false,
      menuIsOpen: false,
      endDate: new Date(),
      endDateString: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
      endDateStringFormatted: Dateconversions.convertEnglishToGermanReadableString(
        new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
      ),
    };

    this.selectedAppointment = {
      therapist: '',
      time: '7:00',
      weekday: this.currentWeekDay,
    };
  }

  addAppointment(event: { therapist: string, patient: string, time: string, hasEnd: boolean, endDate: Date }): void {
    const appointment = new AppointmentSeries(
      event.therapist, event.patient, event.time as unknown as Time, this.currentWeekDay, event.hasEnd, event.endDate,
    );
    if (this.localBackup) {
      this.store.addAppointmentSeries(appointment);
    }
    this.resetInputs();
  }

  changeAppointment(event: { therapist: string, patient: string, time: string, hasEnd: boolean, endDate: Date }): void {
    const appointment = new AppointmentSeries(
      event.therapist, event.patient, event.time as unknown as Time, this.currentWeekDay, event.hasEnd, event.endDate,
    );
    if (this.localBackup) {
      this.store.changeAppointmentSeries(appointment);
    }
  }

  deleteAppointment(event: { patient: string, therapist: string, time: string, hasEnd: boolean, endDate: Date }): void {
    if (this.localBackup) {
      const appointment = new AppointmentSeries(
        event.therapist, event.patient, event.time as unknown as Time, this.currentWeekDay, event.hasEnd, event.endDate,
      );
      this.store.deleteAppointmentSeries(appointment);
    }
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

.hour-begin {
  border-top: 2px ridge #2a2f79;
}

.create-appointment {
  width: 100%;
  height: 100%;
}
</style>
