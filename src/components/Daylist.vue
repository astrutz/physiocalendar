<template>
  <v-container class="d-flex flex-column align-center">
    <v-progress-circular
            v-if="isLoading"
            indeterminate
            color="primary"
            size="50"
          ></v-progress-circular>
  </v-container>


        <vue-cal
          v-if="!isLoading"
          sticky-split-labels
          :split-days="splits"
          :disable-views="['years', 'year', 'month']"
          :hide-view-selector="true"
          :hideTitleBar="true"
          :activeView="'day'"
          v-model="selectedDate"
          :events="events"
          :time-from="6 * 60"
          :time-to="20 * 60"
          :editable-events="{ title: false, drag: true, resize: true, delete: true, create: true }"
          :selected-date="selectedDate"
          @event-dblclick="handleEventClick"
          @cell-click="handleDateClick"
          :locale="locale"
          :timeStep="10"
          :todayButton="true"
          :special-hours="specialHours"
          :showTimeInCells="false"
        >
        <template #split-label="{ split, view }">
          <v-icon>mdi-account</v-icon>
        <strong>{{ split.label }}</strong>
      </template>
        </vue-cal>


    <CreateAppointmentDialog
      :currentDay="selectedDate"
      :appointment="initAppointment"
      v-model="createDialog"
      @saveSingle="addAppointment"
      @saveSeries="addSeriesAppointment"
      @cancel="createDialog = false"
    />

    <SingleAppointmentDialog
      v-if="selectedAppointment"
      :appointment="selectedAppointment"
      :currentDay="selectedDate"
      v-model="singleAppointmentDialog"
      @saveSingle="changeSingleAppointment"
      @saveSeries="changeSeriesAppointment"
      @deleteSingle="deleteSingleAppointment"
      @cancel="singleAppointmentDialog = false"
    />


</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, PropType } from 'vue';
import CreateAppointmentDialog from './CreateAppointmentDialog.vue';
import SingleAppointmentDialog from './SingleAppointmentDialog.vue';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useAppointmentSeriesStore } from '@/store/AppointmentSeriesStore';
import { useTherapistStore } from '@/store/TherapistStore';
import Therapist from '@/class/Therapist';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import Absence from '@/class/Absence';
import { toast } from 'vue3-toastify';
import 'vue-cal/dist/vuecal.css';

// @ts-ignore
import VueCal from 'vue-cal';
import { format } from 'date-fns';
import { formatDate, formatTime, getWeekdayForDate } from '../class/Dateconversions';
import { useAbsenceStore } from '@/store/AbsenceStore';

export default defineComponent({
  components: {
    CreateAppointmentDialog,
    SingleAppointmentDialog,
    VueCal,
  },
  props: {
    currentSingleDay: {
      type: Date as PropType<Date>,
      required: true,
    },
  },
  setup(props) {
    const createDialog = ref(false);
    const isLoading = ref(false);
    const singleAppointmentDialog = ref(false);
    const seriesAppointmentDialog = ref(false);
    const selectedDate = ref<Date>(new Date());
    const selectedAppointment = ref<SingleAppointment | null>(null);
    const selectedSeriesAppointment = ref<AppointmentSeries | null>(null);
    const initAppointment = ref(SingleAppointment.createEmpty());
    const therapists = ref<Therapist[]>([]);

    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();
    const therapistStore = useTherapistStore();
    const absenceStore = useAbsenceStore();
    const splits = ref<any[]>([]);
    const events = ref<any[]>([]);
    const conflicts = ref<SingleAppointment[] | []>([]);

    const customLocale = {
      weekDays: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
      months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      years: 'Jahre',
      year: 'Jahr',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      today: 'Heute',
      noEvent: '',
      allDay: 'Ganztägig',
      deleteEvent: 'Löschen',
      createEvent: 'Ereignis erstellen',
      dateFormat: 'dddd DD.MM.YYYY',  // Format des Datums
    };

    const specialHours = ref({
      1: [{ from: 0, to: 7 * 60, class: 'non-work-hours' }, { from: 7 * 60, to: 19 * 60, class: 'work-hours' }, { from: 19 * 60, to: 24 * 60, class: 'non-work-hours' }],
      2: [{ from: 0, to: 7 * 60, class: 'non-work-hours' }, { from: 7 * 60, to: 19 * 60, class: 'work-hours' }, { from: 19 * 60, to: 24 * 60, class: 'non-work-hours' }],
      3: [{ from: 0, to: 7 * 60, class: 'non-work-hours' }, { from: 7 * 60, to: 19 * 60, class: 'work-hours' }, { from: 19 * 60, to: 24 * 60, class: 'non-work-hours' }],
      4: [{ from: 0, to: 7 * 60, class: 'non-work-hours' }, { from: 7 * 60, to: 19 * 60, class: 'work-hours' }, { from: 19 * 60, to: 24 * 60, class: 'non-work-hours' }],
      5: [{ from: 0, to: 7 * 60, class: 'non-work-hours' }, { from: 7 * 60, to: 19 * 60, class: 'work-hours' }, { from: 19 * 60, to: 24 * 60, class: 'non-work-hours' }],
      6: [{ from: 0, to: 7 * 60, class: 'non-work-hours' }, { from: 7 * 60, to: 19 * 60, class: 'work-hours' }, { from: 19 * 60, to: 24 * 60, class: 'non-work-hours' }],
      7: [{ from: 0, to: 24 * 60, class: 'non-work-hours' }]
    });

    function getDayIndex(weekday: string): number {
      const indexMap = {
        'Montag': 1,
        'Dienstag': 2,
        'Mittwoch': 3,
        'Donnerstag': 4,
        'Freitag': 5,
        'Samstag': 6,
        'Sonntag': 0
      };
      return (indexMap as { [key: string]: number })[weekday] || 0; // Rückgabe 0 für nicht definierte Werte
    }

    const locale = ref(customLocale);

    const generateClassName = (index: number) => `split${(index) + 1}`;

    onMounted(() => {
      refreshData();
    });

    watch(
      () => props.currentSingleDay,
      (newDate: Date) => {
        selectedDate.value = newDate;
        refreshData();
      }
    );

    const refreshData = async () => {
      isLoading.value = true;
      events.value = [];
      await loadTherapists();
      await loadAppointments();
      for (const therapist of therapists.value) {
        await loadAbsences(therapist.id);
      }

      isLoading.value = false;
    };

    const loadAppointments = async () => {
      await appointmentStore.loadAppointments({ date: selectedDate.value });
      
      // Erstelle ein Mapping von therapistId zu Index
      const therapistIndexMap = new Map<number, number>();
      therapists.value.forEach((therapist, index) => {
        therapistIndexMap.set(therapist.id, index + 1);
      });
      
      // Konvertiere Termine in vue-cal Format
      const appointmentEvents = appointmentStore.getAllAppointments.map((appointment) => {
        const therapistIndex = therapistIndexMap.get(appointment.therapist.id) || 0;
        
        // Definiere die Klasse basierend auf dem isGeneratedBySeries-Flag
        let className = appointment.createdBySeriesAppointment ? 'generated-single-appointment' : 'single-appointment';
        className = appointment.patient.isBWO ? 'bwo-appointment' : className;
        className = appointment.isElectric ? 'checkbox-electric' : className;
        className = appointment.isHotair ? 'checkbox-hotair' : className;
        className = appointment.isUltrasonic ? 'checkbox-ultrasonic' : className;

        return {
          id: appointment.id,
          start: formatDateString(appointment.startTime),
          end: formatDateString(appointment.endTime),
          title: appointment.patient.fullName,
          class: className,
          split: therapistIndex,
        };
      });
      
      // Setze nur die appointment events, behalte bestehende Absences
      events.value = [...events.value, ...appointmentEvents];
      console.log( events.value);
    };

    const loadTherapists = async () => {
      await therapistStore.loadTherapists();
      therapists.value = therapistStore.getTherapists().filter((therapist) => therapist.isActive);
      splits.value = therapists.value.map((therapist, index) => ({
        label: therapist.firstName,
        class: generateClassName(index)
      }));
    };

    const loadAbsences = async (therapistId: number) => {
      await absenceStore.loadAbsences(therapistId, { date: selectedDate.value.toISOString().split('T')[0], weekday: getWeekdayForDate(selectedDate.value) });
      
      const therapistAbsences = absenceStore.getAbsencesForTherapist(therapistId);
      console.log(therapistAbsences);
      const absenceEvents = therapistAbsences.map(absence => createAbsenceEvent(absence));

      console.log(absenceEvents);

      // Ergänze die Abwesenheiten zu den bestehenden Events
      events.value = [...events.value, ...absenceEvents];
    };

    function createAbsenceEvent(absence: Absence) {
      // Hole das aktuelle Datum (selectedDate) und extrahiere das Datum ohne Uhrzeit
      const currentDate = new Date(selectedDate.value);
      currentDate.setHours(0, 0, 0, 0); // Setze die Zeit auf Mitternacht

      // Hole die Uhrzeiten der Abwesenheit
      const absenceStartTime = new Date(absence.startTime);
      const absenceEndTime = new Date(absence.endTime);

      // Setze das Start- und Enddatum auf das aktuelle Datum, behalte aber die Uhrzeit
      const start = new Date(currentDate);
      start.setHours(absenceStartTime.getHours(), absenceStartTime.getMinutes(), 0, 0);

      const end = new Date(currentDate);
      end.setHours(absenceEndTime.getHours(), absenceEndTime.getMinutes(), 0, 0);

      // Erstelle das Event mit dem aktualisierten Start- und Enddatum
      return {
        id: 'absence-' + absence.id,
        start: format(start, 'yyyy-MM-dd HH:mm'),
        end: format(end, 'yyyy-MM-dd HH:mm'),
        class: 'absence',
        split: therapistIdToSplitIndex(absence.therapistId)
      };
    }

    function therapistIdToSplitIndex(therapistId: number) {
      return therapists.value.findIndex(t => t.id === therapistId) + 1;
    }

    const formatDateString = (date: Date): string => {
        return format(date, 'yyyy-MM-dd HH:mm');
      };

    const handleEventClick = (event: any) => {
      // Handle event click (open dialogs)
      const appointment = appointmentStore.getAppointmentById(event.id);
      if (appointment) {
        selectedAppointment.value = appointment;
        singleAppointmentDialog.value = true;
      }
    };

    const handleEventDrop = async (event: any) => {
      const { id, start, end } = event;
      try {
        // Hole das bestehende Appointment
        const appointment = await appointmentStore.getAppointmentById(id);

        if (appointment) {
          // Aktualisiere die Start- und Endzeiten
          appointment.startTime = new Date(start);
          appointment.endTime = new Date(end);

          // Speichere das aktualisierte Appointment
          await appointmentStore.updateAppointment(appointment.id, appointment);
        }
      } catch (error) {
        console.error('Error handling event drop:', error);
        toast.error('Fehler beim Verschieben des Termins.');
      }
    };

    const handleEventResize = async (event: any) => {
      const { id, start, end } = event;
      try {
        // Hole das bestehende Appointment
        const appointment = await appointmentStore.getAppointmentById(id);

        if (appointment) {
          // Aktualisiere die Start- und Endzeiten
          appointment.startTime = new Date(start);
          appointment.endTime = new Date(end);

          // Speichere das aktualisierte Appointment
          await appointmentStore.updateAppointment(appointment.id, appointment);
          refreshData(); // Lade die aktualisierten Termine
        }
      } catch (error) {
        console.error('Error handling event resize:', error);
        toast.error('Fehler beim Anpassen des Termins.');
      }
    };

    const handleEventDelete = async (event: any) => {
      const { id } = event;
      try {
        await appointmentStore.deleteAppointment(id);
      } catch (error) {
        console.error('Error handling event delete:', error);
        toast.error('Fehler beim Löschen des Termins.');
      }
    };

    const roundToNearestTenMinutes = (date: Date): Date => {
      const roundedDate = new Date(date);
      const minutes = roundedDate.getMinutes();
      const remainder = minutes % 10;
      const roundedMinutes = remainder === 0 ? minutes : minutes + (10 - remainder);
      roundedDate.setMinutes(roundedMinutes, 0, 0); // Setze Sekunden und Millisekunden auf 0
      return roundedDate;
    };

    const handleDateClick = (event: any) => {
      const clickedDate = new Date(event.date);
      const clickedSplit = event.split;
      const roundedDate = roundToNearestTenMinutes(clickedDate);

      const therapists = therapistStore.getTherapists().filter((therapist) => therapist.isActive);
        
        // Erstelle ein Mapping von therapistId zu Index
        const therapistIndexMap = new Map<number, Therapist>();
        therapists.forEach((therapist, index) => {
          therapistIndexMap.set(index + 1, therapist);
        });

      const therapist = therapistIndexMap.get(clickedSplit);
      if (therapist){
      initAppointment.value = SingleAppointment.createEmpty();
      initAppointment.value.date = roundedDate;
      initAppointment.value.startTime = roundedDate;
      initAppointment.value.endTime = new Date(roundedDate.getTime() + 20 * 60 * 1000);
      initAppointment.value.therapist = therapist;
      openCreateDialog();
      }
    };

    const openCreateDialog = () => {
      createDialog.value = true;
    };

    const addAppointment = async (appointment: SingleAppointment) => {
      await appointmentStore.addAppointment(appointment);
      refreshData();
      createDialog.value = false;
    };

    const addSeriesAppointment = async (appointment: AppointmentSeries) => {
      await appointmentSeriesStore.addAppointmentSeries(appointment);
      refreshData();
      createDialog.value = false;
    };

    const changeSingleAppointment = async (appointment: SingleAppointment) => {
       await appointmentStore.updateAppointment(appointment.id, appointment)
       refreshData();
    };

    const changeSeriesAppointment = (appointment: AppointmentSeries) => {
      appointmentSeriesStore.updateAppointmentSeries(appointment.id, appointment);
      refreshData();
    };

    const deleteSingleAppointment = async (appointment: SingleAppointment) => {
      await appointmentStore.deleteAppointment(appointment.id);
      refreshData();
    };

    const deleteSeriesAppointment = (id: number) => {
      appointmentSeriesStore.deleteAppointmentSeries(id);
      refreshData();
    };

    return {
      createDialog,
      singleAppointmentDialog,
      seriesAppointmentDialog,
      selectedDate,
      selectedAppointment,
      selectedSeriesAppointment,
      initAppointment,
      events,
      therapists,
      isLoading,
      handleEventClick,
      handleDateClick,
      handleEventDrop,
      handleEventResize,
      handleEventDelete,
      openCreateDialog,
      addAppointment,
      addSeriesAppointment,
      changeSingleAppointment,
      changeSeriesAppointment,
      deleteSingleAppointment,
      deleteSeriesAppointment,
      customLocale,
      splits,
      locale,
      specialHours,
      conflicts,
      formatDate,
      formatTime,
      formatDateString,
    };
  },
});
</script>

<style>
/* Style für Einzeltermine */
.single-appointment {
  background-color: rgba(117, 117, 122, 0.3); /* Hellblau für reguläre Einzeltermine */
}

/* Style für aus Serienterminen generierte Einzeltermine */
.generated-single-appointment {
  background-color: rgba(7, 247, 87, 0.3)
}

.checkbox-electric {
  background-color: yellow;
}

.checkbox-hotair {
  background-color: orange;
}

.checkbox-ultrasonic {
  background-color: rgba(208, 85, 233, 0.3); /* Hier kannst du den gewünschten Farbton anpassen */
}

.bwo-appointment {
  background-color: lightblue;
}


.day-split-header {font-size: 10px;}
.vuecal__body .split1, 
.vuecal__body .split2, 
.vuecal__body .split3, 
.vuecal__body .split4, 
.vuecal__body .split5, 
.vuecal__body .split6, 
.vuecal__body .split7, 
.vuecal__body .split8, 
.vuecal__body .split9, 
.vuecal__body .split10, 
.vuecal__body .split11, 
.vuecal__body .split12 {
  border-right: 1px solid black;
}

.non-work-hours {
  background-color: #333; /* Dunkelgrau für Nicht-Arbeitszeiten */
}

.absence {
  background-color: #333; /* Dunkelgrau für Nicht-Arbeitszeiten */
}

.vuecal__event-time {
  display: none;
}

</style>
