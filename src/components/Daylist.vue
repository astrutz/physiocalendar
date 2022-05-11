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
                'cell-filled':
                  row[header.value] &&
                  row[header.value].patient &&
                  row[header.value].startDate,
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
              <DaylistElement
                v-else-if="row[header.value] && row[header.value].patient"
                @appointmentAdded="addAppointment($event)"
                @appointmentChanged="changeAppointment($event)"
                @appointmentDeleted="deleteAppointment($event)"
                :patient="row[header.value].patient"
                :therapist="row[header.value].therapist"
                :time="row.time"
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
          {{ selectedAppointment.time }}
        </v-card-title>

        <v-card-text class="pt-5">
          <v-text-field
            label="Name des Patienten"
            v-model="inputFields.patientTextfield"
            clearable
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="error" text @click="resetInputs(); createDialog = false">
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
                patient: inputFields.patientTextfield,
                time: selectedAppointment.time,
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
import DaylistElement from './DaylistElement.vue';

@Component({
  components: {
    DaylistElement,
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
    time: '7:00',
    day: this.currentSingleDay,
  };

  store = getModule(Store);

  private headers = [
    { text: '', value: 'time' },
  ];

  private rows: {
    [key: string]: string | Time | SingleAppointment | AppointmentSeries
  }[] = [{ timeString: '' }];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('currentSingleDay')
  currentSingleDayChanged(): void {
    this.createHeaders();
    this.createRows();
  }

  @Watch('localBackup')
  localBackupChanged(): void {
    this.createHeaders();
    this.createRows();
  }

  mounted(): void {
    this.createHeaders();
    this.createRows();
  }

  createHeaders(): void {
    if (this.localBackup !== null) {
      const currentSingleDate = Dateconversions.convertReadableStringToDate(this.currentSingleDay);
      const therapistHeaders = this.localBackup.therapists.filter(
        (therapist) => therapist.activeSince < currentSingleDate && therapist.activeUntil > currentSingleDate,
      ).map((therapist) => ({ text: therapist.name, value: therapist.name, align: 'center' }));
      this.headers = [{ text: '', value: 'time' }].concat(therapistHeaders);
    }
  }

  createRows(): void {
    type TableRow = {
      [key: string]: string | Time | SingleAppointment | AppointmentSeries
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
          const singleAppointment = this.localBackup?.daylist.searchAppointment(
            header.text, this.currentSingleDay, row.time as Time,
          );
          if (singleAppointment !== undefined) {
            newRow[header.text] = singleAppointment;
          } else {
            const currentSingleDate = Dateconversions.convertReadableStringToDate(this.currentSingleDay);
            let weekday: Weekday;
            switch (currentSingleDate.getDay()) {
              case 1: weekday = Weekday.MONDAY; break;
              case 2: weekday = Weekday.TUESDAY; break;
              case 3: weekday = Weekday.WEDNESDAY; break;
              case 4: weekday = Weekday.THURSDAY; break;
              case 5: weekday = Weekday.FRIDAY; break;
              default: weekday = Weekday.MONDAY; break;
            }
            const masterAppointment = this.localBackup?.masterlist.searchAppointmentForDaylist(
              header.text, weekday, row.time as Time, currentSingleDate,
            );
            newRow[header.text] = masterAppointment || '';
          }
        }
      });
      return newRow;
    });
  }

  openCreateDialog(therapist: string, time: string): void {
    this.selectedAppointment.therapist = therapist;
    this.selectedAppointment.time = time;
    this.createDialog = true;
  }

  resetInputs(): void {
    this.inputFields = {
      patientTextfield: '',
    };

    this.selectedAppointment = {
      therapist: '',
      time: '7:00',
      day: this.currentSingleDay,
    };
  }

  addAppointment(event: { therapist: string, patient: string, time: string }): void {
    const appointment = new SingleAppointment(
      event.therapist, event.patient, event.time as unknown as Time, Dateconversions.convertReadableStringToDate(this.currentSingleDay),
    );
    if (this.localBackup) {
      this.store.addSingleAppointment(appointment);
    }
    this.resetInputs();
  }

  changeAppointment(event: { therapist: string, patient: string, time: string }): void {
    const appointment = new SingleAppointment(
      event.therapist, event.patient, event.time as unknown as Time, Dateconversions.convertReadableStringToDate(this.currentSingleDay),
    );
    if (this.localBackup) {
      this.store.changeSingleAppointment(appointment);
    }
  }

  deleteAppointment(event: { patient: string, therapist: string, time: string }): void {
    if (this.localBackup) {
      const appointment = new SingleAppointment(
        event.therapist, event.patient, event.time as unknown as Time, Dateconversions.convertReadableStringToDate(this.currentSingleDay),
      );
      this.store.deleteSingleAppointment(appointment);
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

.cell-filled {
  background-color: lightgreen;
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
