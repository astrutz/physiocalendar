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
import { toast } from 'vue3-toastify';
import 'vue-cal/dist/vuecal.css';

// @ts-ignore
import VueCal from 'vue-cal';
import { format } from 'date-fns';
import { formatDate, formatTime } from '../class/Dateconversions';

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

    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();
    const therapistStore = useTherapistStore();
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

    const locale = ref(customLocale);

    const generateClassName = (index: number) => `split${(index) + 1}`;

    onMounted(() => {
      loadTherapists();
      loadAppointments();
      checkForConflicts();
    });

    watch(selectedDate, async () => {
      await loadAppointments();
    });

    watch(
      () => props.currentSingleDay,
      (newDate: Date) => {
        selectedDate.value = newDate;
      }
    );

    const loadTherapists = async () => {
      await therapistStore.loadTherapists();
      const therapists = therapistStore.getTherapists().filter((therapist) => therapist.isActive);
      splits.value = therapists.map((therapist, index) => ({
        label: therapist.firstName,
        class: generateClassName(index)
      }));
    };

    const checkForConflicts = async () => {
      await appointmentStore.loadAppointmentConflicts();
      const conflictResults = await appointmentStore.getAppointmentConflicts;
      conflicts.value = conflictResults;
    }

    const formatDateString = (date: Date): string => {
        return format(date, 'yyyy-MM-dd HH:mm');
      };

    const loadAppointments = async () => {
        await appointmentStore.loadAppointments();

        // Lade Therapeuten
        const therapists = therapistStore.getTherapists();
        
        // Erstelle ein Mapping von therapistId zu Index
        const therapistIndexMap = new Map<number, number>();
        therapists.forEach((therapist, index) => {
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
            split: therapistIndex, // Hier wird der korrekte Index zugewiesen
          };
        });

        events.value = [...appointmentEvents];
    };

    const handleEventClick = (event: any) => {
      // Handle event click (open dialogs)
      const appointment = appointmentStore.getAppointmentById(event.id);
      console.log(appointment);
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
          await loadAppointments(); // Lade die aktualisierten Termine
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
        await loadAppointments(); // Lade die aktualisierten Termine
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

      const therapists = therapistStore.getTherapists();
        
        // Erstelle ein Mapping von therapistId zu Index
        const therapistIndexMap = new Map<number, Therapist>();
        therapists.forEach((therapist, index) => {
          therapistIndexMap.set(index + 1, therapist);
        });

      const therapist = therapistIndexMap.get(clickedSplit);
      if (therapist){
        // Initialisiere das Terminobjekt
      initAppointment.value = SingleAppointment.createEmpty();
      initAppointment.value.date = roundedDate;
      initAppointment.value.startTime = roundedDate;
      initAppointment.value.endTime = new Date(roundedDate.getTime() + 20 * 60 * 1000);
      initAppointment.value.therapist = therapist;
      console.log(initAppointment);
      openCreateDialog();
      }
    };

    const openCreateDialog = () => {
      createDialog.value = true;
    };

    const addAppointment = async (appointment: SingleAppointment) => {
      await appointmentStore.addAppointment(appointment);
      loadAppointments();
      createDialog.value = false;
    };

    const addSeriesAppointment = async (appointment: AppointmentSeries) => {
      await appointmentSeriesStore.addAppointmentSeries(appointment);
      loadAppointments();
      createDialog.value = false;
    };

    const changeSingleAppointment = async (appointment: SingleAppointment) => {
       await appointmentStore.updateAppointment(appointment.id, appointment)
       loadAppointments();
    };

    const changeSeriesAppointment = (appointment: AppointmentSeries) => {
      appointmentSeriesStore.updateAppointmentSeries(appointment.id, appointment);
      loadAppointments();
    };

    const deleteSingleAppointment = async (appointment: SingleAppointment) => {
      await appointmentStore.deleteAppointment(appointment.id);
      loadAppointments();
    };

    const deleteSeriesAppointment = (id: number) => {
      appointmentSeriesStore.deleteAppointmentSeries(id);
      loadAppointments();
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
/* vuecal__flex vuecal__cell-content vuecal__cell-split split1 */
</style>
