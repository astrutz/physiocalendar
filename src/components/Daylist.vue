<template>
  <div>
    <v-simple-table style="margin-top: 16px" dense>
      <template v-slot:default>
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.value" class="text-center text-subtitle-2">
              <DaylistHeader
                :therapist="header.text"
                :therapistID="header.id"
                :date="currentSingleDay"
                @absencesChanged="saveAbsences($event)"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="row.startTimeString">
            <td
              v-for="header in headers"
              :key="header.value"
              @click="openCreateDialog((header.text, header.id), row.startTime)"
              :class="getClassForCell(row[header.value])"
            >
              <div v-if="!row[header.value]">
                <v-btn text @click="openCreateDialog(header.text, header.id, row.startTime)">+</v-btn>
              </div>
              <div v-else-if="row[header.value] instanceof SingleAppointment">
                <v-btn text @click="openSingleAppointmentDialog(row[header.value])">
                  {{ row[header.value].patient }}
                </v-btn>
              </div>
              <div v-else-if="row[header.value] instanceof AppointmentSeries">
                <v-btn text @click="openSeriesAppointmentDialog(row[header.value])">
                  {{ row[header.value].patient }} (Serie)
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <!-- Dialog für das Erstellen eines Termins -->
    <create-appointment-dialog
      v-if="createDialog"
      :therapist="selectedTherapist"
      :currentDay="currentSingleDay"
      v-model="createDialog"
      @saveSingle="addAppointment"
      @saveSeries="addSeriesAppointment"
    />

    <!-- Dialog für das Anzeigen und Bearbeiten eines Einzeltermins -->
    <single-appointment-dialog
      v-if="openSingleAppointmentDialog"
      :appointment="selectedAppointment"
      @save="changeSingleAppointment"
      @delete="deleteSingleAppointment"
      v-model="openSingleAppointmentDialog"
    />

    <!-- Dialog für das Anzeigen und Bearbeiten eines Serientermins -->
    <appointment-series-dialog
      v-if="openSeriesAppointmentDialog"
      :appointment="selectedSeriesAppointment"
      @save="changeSeriesAppointment"
      @delete="deleteSeriesAppointment"
      v-model="openSeriesAppointmentDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import DaylistHeader from './DaylistHeader.vue';
import CreateAppointmentDialog from './CreateAppointmentDialog.vue';
import SingleAppointmentDialog from './SingleAppointmentDialog.vue';
import AppointmentSeriesDialog from './AppointmentSeriesDialog.vue';
import { getModule } from 'vuex-module-decorators';
import AppointmentStore from '@/store/AppointmentStore';
import AppointmentSeriesStore from '@/store/AppointmentSeriesStore';
import { Time } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';
import Therapist from '@/class/Therapist';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import { TimeUtils } from '@/class/TimeUtils';
import Absence from '@/class/Absence';
import AbsenceStore from '../store/AbsenceStore';

@Component({
  components: {
    DaylistHeader,
    CreateAppointmentDialog,
    SingleAppointmentDialog,
    AppointmentSeriesDialog,
  },
})
export default class Daylist extends Vue {

  @Prop({ required: true }) currentSingleDay!: Date;

  public createDialog: boolean = false;
  public singleAppointmentDialog: boolean = false;
  public seriesAppointmentDialog: boolean = false;
  public selectedTherapist: Therapist | null = null;
  public selectedAppointment: SingleAppointment | null = null;
  public selectedSeriesAppointment: AppointmentSeries | null = null;

  appointmentStore = getModule(AppointmentStore);
  appointmentSeriesStore = getModule(AppointmentSeriesStore);
  absenceStore = getModule(AbsenceStore)

  public headers: Array<{ id: number; text: string; value: number}> = [];
  public rows: Array<Record<string, any>> = [];

  @Watch('currentSingleDay')
  async onDateChange() {
    await this.loadAppointments();
  }

  mounted() {
    this.createHeaders();
    this.loadAppointments();
  }

  private createHeaders(): void {
    // Beispielhafte Header-Daten; sollte auf Basis deiner Datenquelle erstellt werden.
    this.headers = this.getTherapists().map(therapist => ({
      id: therapist.id,
      text: therapist.name,
      value: therapist.id,
    }));
  }

  private async loadAppointments(): Promise<void> {
    const date: string = this.currentSingleDay.toISOString();
    await this.appointmentStore.loadAppointmentsForDate(date);
    await this.appointmentSeriesStore.loadSeriesAppointmentsForDate(date);
    this.createRows();
  }

  private createRows(): void {
    TimeUtils.initializeTimes(); // Sicherstellen, dass die Zeiten initialisiert sind
    const startTimes = TimeUtils.getTimes();
    this.rows = startTimes.map((time) => {
      const row: Record<string, any> = { startTimeString: TimeUtils.formatTime(time), startTime: time };
      this.headers.forEach((header) => {
        const singleAppointment: SingleAppointment | undefined = this.appointmentStore.getAppointmentByTherapistAndTime(header.id, this.currentSingleDay, time);
        const seriesAppointment = this.appointmentSeriesStore.getAppointmentSeriesByTherapistAndTime(header.id, this.currentSingleDay, time);

        if (singleAppointment) {
          row[header.value] = singleAppointment;
        } else if (seriesAppointment) {
          row[header.value] = seriesAppointment;
        } else {
          row[header.value] = null;
        }
      });
      return row;
    });
}



  private getTherapists(): Therapist[] {
    // Diese Methode sollte die Liste der Therapeuten aus dem Store oder einer API laden.
    return [];
  }

  public openCreateDialog(header: { text: string, id: number }, startTime: Date): void {
    const therapist = this.getTherapists().find(t => t.id === header.id);
    if (therapist) {
      this.selectedTherapist = therapist;
      this.createDialog = true;
    }
  }

  public openSingleAppointmentDialog(appointment: SingleAppointment): void {
    this.selectedAppointment = appointment;
    this.singleAppointmentDialog = true;
  }

  public openSeriesAppointmentDialog(appointment: AppointmentSeries): void {
    this.selectedSeriesAppointment = appointment;
    this.singleAppointmentDialog = true;
  }

  public addAppointment(appointment: SingleAppointment): void {
    this.appointmentStore.addAppointment(appointment);
    this.loadAppointments();
  }

  public addSeriesAppointment(appointment: AppointmentSeries): void {
    this.appointmentSeriesStore.addAppointmentSeries(appointment);
    this.loadAppointments();
  }

  public changeSingleAppointment(appointment: SingleAppointment): void {
    this.appointmentStore.updateAppointment(appointment.id, appointment);
    this.loadAppointments();
  }

  public changeSeriesAppointment(appointment: AppointmentSeries): void {
    this.appointmentSeriesStore.updateAppointmentSeries(appointment.id, appointment);
    this.loadAppointments();
  }

  public changeAbsences(absence: Absence): void {
    this.absenceStore.updateAbsence(absence.id, absence);
    this.loadAppointments();
  }

  public deleteSingleAppointment(id: number): void {
    this.appointmentStore.deleteAppointment(id);
    this.loadAppointments();
  }

  public deleteSeriesAppointment(id: number): void {
    this.appointmentSeriesStore.deleteAppointmentSeries(id);
    this.loadAppointments();
  }

  public getClassForCell(entry: SingleAppointment | AppointmentSeries | null): string {
    if (!entry) return '';
    if (entry instanceof SingleAppointment) {
      return entry.isHotair ? 'cell-hotair' : entry.isUltrasonic ? 'cell-ultrasonic' : entry.isElectric ? 'cell-electric' : '';
    }
    if (entry instanceof AppointmentSeries) {
      return entry.isBWO ? 'cell-bwo' : '';
    }
    return '';
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
