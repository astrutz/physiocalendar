<template>
  <v-container class="d-flex flex-column align-center">
    <!-- Konflikte anzeigen -->
    <v-row justify="center">
      <v-col cols="12">
        <v-alert v-if="conflicts.length > 0" type="warning" dense>
          Konflikt gefunden:
          <v-list dense>
            <v-list-item v-for="(conflict, index) in conflicts" :key="index">
                 {{ formatDate(conflict.date) }} bei {{ conflict.therapist.firstName }} um {{ formatTime(conflict.startTime) }}
            </v-list-item>
          </v-list>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
    <!-- vue-cal Kalender -->

        <vue-cal
          sticky-split-labels
          :split-days="splits"
          :disable-views="['years', 'year', 'month']"
          :hide-view-selector="true"
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
import { formatDate, formatTime } from '../class/Dateconversions';
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
      await loadTherapists();
      checkForConflicts();
    };

    const loadTherapists = async () => {
      await therapistStore.loadTherapists();
      therapists.value = therapistStore.getTherapists().filter((therapist) => therapist.isActive);
      splits.value = therapists.value.map((therapist, index) => ({
        label: therapist.firstName,
        class: generateClassName(index)
      }));
      await loadAppointments();
      for (const therapist of therapists.value) {
        await loadAbsences(therapist.id);
      }
    };

    const loadAbsences = async (therapistId: number) => {
      await absenceStore.loadAbsences(therapistId);
      const therapistAbsences = absenceStore.getAbsencesForTherapist(therapistId);
      const today = new Date(selectedDate.value);

      therapistAbsences.forEach(absence => {
        let eventAdded = false;

        if (absence.weekday) {
          const absenceDayIndex = getDayIndex(absence.weekday);
          const todayDayIndex = today.getDay();

          if (absenceDayIndex === todayDayIndex) {
            const startTime = new Date(today);
            const endTime = new Date(today);

            startTime.setHours(new Date(absence.startTime).getHours(), new Date(absence.startTime).getMinutes(), 0, 0);
            endTime.setHours(new Date(absence.endTime).getHours(), new Date(absence.endTime).getMinutes(), 0, 0);

            absence.startTime = startTime;
            absence.endTime = endTime;

            events.value.push(createAbsenceEvent(absence));
            eventAdded = true;
          }
        } else if (absence.date) {
          const absenceDate = new Date(absence.date);

          if (absenceDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
              events.value.push(createAbsenceEvent(absence));
            eventAdded = true;
          }
        }

      });
    };

    function createAbsenceEvent(absence: Absence) {
      return {
        id: 'absence-' + absence.id,
        start: format(absence.startTime, 'yyyy-MM-dd HH:mm'),
        end: format(absence.endTime, 'yyyy-MM-dd HH:mm'),
        class: 'absence',
        split: therapistIdToSplitIndex(absence.therapistId)
      };
    }

    const loadAppointments = async () => {
        await appointmentStore.loadAppointments();
        
        // Erstelle ein Mapping von therapistId zu Index
        const therapistIndexMap = new Map<number, number>();
        therapists.value.forEach((therapist, index) => {
          therapistIndexMap.set(therapist.id, index + 1);
        });
        // Konvertiere Termine in vue-cal Format
        const appointmentEvents = appointmentStore.getAppointmentsForDate(selectedDate.value).map((appointment) => {
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

        events.value = [...appointmentEvents];
    };

    function therapistIdToSplitIndex(therapistId: number) {
      return therapists.value.findIndex(t => t.id === therapistId) + 1;
    }
    
    const checkForConflicts = async () => {
      await appointmentStore.loadAppointmentConflicts();
      const conflictResults = await appointmentStore.getAppointmentConflicts;
      conflicts.value = conflictResults;
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
          await loadAppointments(); // Lade die aktualisierten Termine
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
        // Lösche das Appointment
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

</style>
