<template>
  <v-container class="d-flex justify-center align-center">

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
      :timeStep="20"
      :todayButton="true"
    >
    <template #split-label="{ split, view }">
      <v-icon>mdi-account</v-icon>
    <strong>{{ split.label }}</strong>
  </template>
    </vue-cal>


    <CreateAppointmentDialog
      v-if="createDialog"
      :currentDay="selectedDate"
      :appointment="initAppointment"
      v-model="createDialog"
      @saveSingle="addAppointment"
      @saveSeries="addSeriesAppointment"
      @cancel="createDialog = false"
    />

    <SingleAppointmentDialog
      v-if="selectedAppointment && singleAppointmentDialog"
      :appointment="selectedAppointment"
      :currentDay="selectedDate"
      v-model="singleAppointmentDialog"
      @saveSingle="changeSingleAppointment"
      @deleteSingle="deleteSingleAppointment"
      @cancel="singleAppointmentDialog = false"
    />

  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import CreateAppointmentDialog from './CreateAppointmentDialog.vue';
import SingleAppointmentDialog from './SingleAppointmentDialog.vue';
import AppointmentSeriesDialog from './AppointmentSeriesDialog.vue';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useAppointmentSeriesStore } from '@/store/AppointmentSeriesStore';
import { useTherapistStore } from '@/store/TherapistStore';
import Therapist from '@/class/Therapist';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import { toast } from 'vue3-toastify';
import 'vue-cal/dist/vuecal.css';
import { de } from 'date-fns/locale';
import VueCal from 'vue-cal';
import { format } from 'date-fns';

export default defineComponent({
  components: {
    CreateAppointmentDialog,
    SingleAppointmentDialog,
    AppointmentSeriesDialog,
    VueCal,
  },
  props: {
    currentSingleDay: {
      type: Date,
      required: true,
    },
  },
  setup(props, { emit }) {
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

    const colors = [
      'blue', 'green', 'orange', 'red', 'purple', 'pink', 
      'cyan', 'teal', 'lime', 'indigo', 'amber', 'gray'
    ];
    
      // Dynamisch Klassennamen generieren
    const generateClassName = (index: number) => `split${(index % colors.length) + 1}`;

    onMounted(() => {
      loadTherapists();
      loadAppointments();
    });

    watch(selectedDate, async () => {
      await loadAppointments();
    });

    watch(
      () => props.currentSingleDay,
      (newDate) => {
        selectedDate.value = newDate;
      }
    );

    const loadTherapists = async () => {
      await therapistStore.loadTherapists();
      const therapists = therapistStore.getTherapists();
      splits.value = therapists.map((therapist, index) => ({
        label: therapist.firstName,
        class: generateClassName(index)
      }));
    };

    const formatDate = (date: Date): string => {
        return format(date, 'yyyy-MM-dd HH:mm');
      };

    const loadAppointments = async () => {
        const date: string = formatDate(selectedDate.value);
        await appointmentStore.loadAppointments();

        // Lade Therapeuten
        const therapists = therapistStore.getTherapists();
        
        // Erstelle ein Mapping von therapistId zu Index
        const therapistIndexMap = new Map<number, number>();
        therapists.forEach((therapist, index) => {
          therapistIndexMap.set(therapist.id, index + 1);
        });
        //console.log('Loaded Appointments:', a); // Debugging
        // Konvertiere Termine in vue-cal Format
        const appointmentEvents = appointmentStore.getAllAppointments.map((appointment) => {
          const therapistIndex = therapistIndexMap.get(appointment.therapist.id) || 0; // Standardwert 0, falls kein Therapist gefunden
          return {
            id: appointment.id,
            start: formatDate(appointment.startTime),
            end: formatDate(appointment.endTime),
            title: appointment.patient.fullName,
            class: 'single-appointment',
            split: therapistIndex, // Hier wird der korrekte Index zugewiesen
          };
        });

        console.log('Loaded Events:', appointmentEvents); // Debugging
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
          therapistIndexMap.set(index+1, therapist);
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
    };
  },
});
</script>

<style scoped>
/* Optional styles for vue-cal */

.day-split-header {font-size: 40px;}
.split1 { background-color: rgba(0, 0, 255, 0.7); } /* Blue */
.vuecal__body .split2 { background-color: rgba(0, 255, 0, 0.7); } /* Green */
.vuecal__body .split3 { background-color: rgba(255, 165, 0, 0.7); } /* Orange */
.vuecal__body .split4 { background-color: rgba(255, 0, 0, 0.7); } /* Red */
.vuecal__body .split5 { background-color: rgba(128, 0, 128, 0.7); } /* Purple */
.vuecal__body .split6 { background-color: rgba(255, 192, 203, 0.7); } /* Pink */
.vuecal__body .split7 { background-color: rgba(0, 255, 255, 0.7); } /* Cyan */
.vuecal__body .split8 { background-color: rgba(0, 128, 128, 0.7); } /* Teal */
.vuecal__body .split9 { background-color: rgba(255, 255, 0, 0.7); } /* Lime */
.vuecal__body .split10 { background-color: rgba(75, 0, 130, 0.7); } /* Indigo */
.vuecal__body .split11 { background-color: rgba(255, 193, 7, 0.7); } /* Amber */
.vuecal__body .split12 { background-color: rgba(128, 128, 128, 0.7); } /* Gray */

</style>
