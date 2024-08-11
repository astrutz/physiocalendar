<template>
  <v-dialog persistent v-model="dialogIsOpen" width="800">
    <template v-slot:activator="{ on, attrs }">
      <button
        type="button"
        @click="dialogIsOpen = true"
        v-bind="attrs"
        v-on="on"
        :class="{ 'cell-button': !isException }"
      >
        <span v-if="!isException" class="textcenter">
          {{ appointment.patient.firstName }}
        </span>
      </button>
      <span v-if="isException" class="appointmentSeries textcenter">
        <div class="elementrow">
          <span>
            <button
              class="cancelled exception textcenter"
              type="button"
              v-bind="attrs"
              v-on="on"
            >
              {{ appointment.patient.firstName }}
            </button>
          </span>
        </div>
        <div class="replacements" v-if="replacementAppointments.length > 0">
          <ul>
            <li v-for="appointment in replacementAppointments" :key="appointment.id">
              <button
                :class="{
                  listentry: true,
                  ishotair: appointment.isHotair,
                  isultrasonic: appointment.isUltrasonic,
                  iselectric: appointment.isElectric,
                  singleAppointment: !appointment.isElectric && !appointment.isUltrasonic && !appointment.isHotair,
                }"
                type="button"
                @click="openDialog(appointment)"
              >
                {{ appointment.patient }} {{ appointment.startTime }} - {{ appointment.endTime }}
              </button>
            </li>
          </ul>
        </div>
      </span>
    </template>
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ appointment.therapist.name }} - {{ appointment.weekday }} {{ appointment.date }} - {{ appointment.startTime }} bis {{ appointment.endTime }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-combobox
          :disabled="appointment?.id != null"
          :value="appointment.patient.firstName"
          v-model="patientTextfield"
          :loading="patientsLoading"
          :items="foundPatients"
          :search-input.sync="searchValue"
          @input="searchPatients($event)"
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
          :value="appointment?.startTime"
        ></v-select>

        <v-select
          :disabled="!isSingleAppointment"
          :items="getAllTimes()"
          label="Ende um"
          v-model="endTimeSelect"
          :value="appointment?.endTime"
        ></v-select>

        <v-row v-if="!isSingleAppointment">
          <v-menu
            v-model="startDatePickerIsOpen"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="startDateStringFormatted"
                label="Start Datum"
                persistent-hint
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                @blur="startDateStringFormatted = startDateStringFormatted"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="startDateStringFormatted"
              :allowed-dates="dateIsAllowed"
              @input="onStartDateChange"
              locale="de-de"
              :first-day-of-week="1"
            ></v-date-picker>
          </v-menu>
          <v-menu
            v-model="endDatePickerIsOpen"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="endDateStringFormatted"
                label="End Datum"
                persistent-hint
                prepend-icon="mdi-calendar"
                v-bind="attrs"
                @blur="endDateStringFormatted = endDateStringFormatted"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="endDateStringFormatted"
              :allowed-dates="dateIsAllowed"
              @input="onEndDateChange"
              locale="de-de"
              :first-day-of-week="1"
            ></v-date-picker>
          </v-menu>
        </v-row>

        <v-text-field
          label="Sonstige Bemerkungen"
          v-model="commentTextfield"
          clearable
        ></v-text-field>

        <v-row>
          <v-col>
            <v-checkbox label="Heißluft" v-model="isHotairField"></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox label="Ultraschall" v-model="isUltrasonicField"></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox label="Elektro" v-model="isElectricField"></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          color="normal"
          text
          @click="
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
        <v-spacer v-if="isSingleAppointment"></v-spacer>
        <v-btn color="warning" @click="printAppointment()" text>
          Drucken
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="appointmentId !== null"
          color="success"
          button
          @click="saveAppointment"
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
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import AppointmentStore from '@/store/AppointmentStore';
import holidaysJSON from '@/data/holidays.json';

@Component
export default class DaylistElement extends Vue {
  @Prop({ default: '' }) readonly currDate!: string;

  @Prop({ default: '' }) readonly appointmentId!: number | null;

  @Prop({ default: () => null }) readonly appointment!: SingleAppointment;

  @Prop({ default: () => null }) readonly appointmentSeries!: AppointmentSeries;

  appointmentStore = getModule(AppointmentStore);

  public dialogIsOpen = false;

  public startDatePickerIsOpen = false;

  public endDatePickerIsOpen = false;

  public patientTextfield = this.appointment?.patient || '';

  public patientTextField1 = '';

  public startTimeSelect = this.appointment?.startTime || '';

  public endTimeSelect = this.appointment?.endTime || '';

  public commentTextfield = this.appointment?.comment || '';

  public isExceptionField = false;

  public isHotairField = this.appointment?.isHotair || false;

  public isUltrasonicField = this.appointment?.isUltrasonic || false;

  public isElectricField = this.appointment?.isElectric || false;

  public startDateStringFormatted = this.appointmentSeries?.startDate;

  public endDateStringFormatted = this.appointmentSeries?.endDate;

  public appointmentsForPatient: Appointment[] = [];

  public replacementAppointments: Appointment[] = [];

  public patientsLoading = false;

  public searchValue = '';

  public foundPatients : string[] = [];

  public holidays = holidaysJSON.days;

  public isSingleAppointment = true; //TODO

  mounted(): void {
    if (this.appointmentId && !this.appointment) {
      // Lade den Termin aus dem Store, falls nur die ID übergeben wurde
      const appointment = this.appointmentStore.getAppointmentById(this.appointmentId);
      if (appointment) {
        this.initializeAppointment(appointment);
      }
    }
  }

  private initializeAppointment(appointment: SingleAppointment): void {
    this.patientTextfield = appointment.patient;
    this.startTimeSelect = appointment.startTime;
    this.endTimeSelect = appointment.endTime;
    this.commentTextfield = appointment.comment;
    //this.isExceptionField = appointment.isException;
    this.isHotairField = appointment.isHotair;
    this.isUltrasonicField = appointment.isUltrasonic;
    this.isElectricField = appointment.isElectric;
    //this.startDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(appointment.startDate);
    //this.endDateStringFormatted = Dateconversions.convertEnglishToGermanReadableString(appointment.endDate);
    //this.isSingleAppointment = appointment.isSingleAppointment;
  }

  @Watch('searchValue')
  searchValueChanged(val: string | undefined): void {
    this.foundPatients = [];
    this.appointment.patient.firstName = val || this.patientTextfield;
    this.searchPatients(val);
  }

  public saveAppointment(): void {
    const appointmentData = {
      patient: this.patientTextfield,
      therapist: this.appointment?.therapist,
      therapistID: this.appointment?.therapistId,
      startTime: this.startTimeSelect,
      endTime: this.endTimeSelect,
      comment: this.commentTextfield,
      startDate: this.startDateStringFormatted,
      endDate: this.endDateStringFormatted,
      isHotair: this.isHotairField,
      isUltrasonic: this.isUltrasonicField,
      isElectric: this.isElectricField,
    };

    if (this.isSingleAppointment) {
      this.$emit('singleAppointmentChanged', appointmentData);
    } else {
      this.$emit('appointmentChanged', appointmentData);
    }

    this.dialogIsOpen = false;
  }

  public deleteSingleAppointment(): void {
    if (confirm('Soll dieser Termin wirklich unwiderruflich gelöscht werden?')) {
      this.$emit('appointmentDeleted', this.appointment?.id);
      this.dialogIsOpen = false;
    }
  }

  public printAppointment(): void {
    // const printer = new Printer(
    //   this.appointmentId,
    //   this.patientTextfield,
    //   this.appointment?.therapist,
    //   this.startTimeSelect,
    //   this.endTimeSelect as unknown as Time,
    //   (this.appointment as any).weeklyFrequency || 0,
    //   (this.appointment as any).cancellations || [],
    //   this.appointmentSeries.startDate,
    //   this.appointmentSeries.endDate,
    //   new Date(),
    // );

    // if (this.isSingleAppointment) {
    //   printer.printSingleAppointment(this.appointmentsForPatient);
    // } else {
    //   printer.printSeriesAppointment(this.appointmentsForPatient);
    // }
  }

  public searchPatients(searchQuery: string | undefined): void {
    // Implementiere die Patientensuche im Store
  }

  public onStartDateChange(): void {
    this.startDateStringFormatted = this.startDateStringFormatted;
  }

  public onEndDateChange(): void {
    this.endDateStringFormatted = this.endDateStringFormatted;
  }

  public dateIsAllowed(dateVal: string | Date): boolean {
    const dateString = typeof dateVal === 'string' ? dateVal : Dateconversions.convertDateToReadableString(dateVal);
    const day = new Date(dateString).getDay();
    return day > 0 && day < 6 && !this.holidays.includes(dateString);
  }

  public getAllTimes(): string[] {
    return Dateconversions.getAllTimes();
  }
}
</script>

<style scoped>
.cancelled {
  text-decoration: line-through;
}
.textcenter {
  width: 100%;
  height: 100%;
  text-align: center;
}
.exception {
  font-size: 10px;
  height: 20px;
  overflow: hidden;
  vertical-align: center;
  line-height: 20px;
}
.cell-button {
  width: 100%;
  height: 100%;
  padding: 0;
}
.replacements ul {
  list-style-type: none;
  padding: 0;
}
.ishotair {
  background-color: rgb(228, 150, 5);
}
.singleAppointment {
  background-color: rgb(255, 255, 255);
}
.iselectric {
  background-color: rgb(255, 61, 61);
}
.isultrasonic {
  background-color: lightskyblue;
}
.listentry {
  margin-top: 5px;
  margin-bottom: 5px;
  border: 1px solid black;
}
.elementrow {
  height: 20px;
  display: flex;
  align-items: center;
}
.ersatzpatientrow {
  margin-top: 5px;
  max-height: 50px;
  overflow: hidden;
  font-size: 10px;
  display: flex;
  align-items: left;
  border: 1px solid black;
}
</style>
