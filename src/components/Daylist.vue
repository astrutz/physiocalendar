<template>
  <v-container class="d-flex justify-center align-center">
   <v-progress-circular
     v-if="loading"
     indeterminate
     color="primary"
     class="d-flex justify-center my-4"
   ></v-progress-circular>
   <v-table v-else dense>
   <thead>
     <tr>
       <th class="text-center text-subtitle-2"> <!-- Leere Spalte -->
       </th>
       <th v-for="header in headers" :key="header.value" class="text-center text-subtitle-2">
         <span>{{ header.therapist.firstName }}</span>
       </th>
     </tr>
   </thead>
   <tbody>
     <tr v-for="(row, rowIndex) in rows" :key="rowIndex" v-if="rows.length > 0">
       <td class="text-center">
         {{ row.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
       </td> 
       <td 
         v-for="header in headers"
         :key="header.value"
         @click="handleCellClick(header.id, row.startTime, row[header.value])"
         :class="getClassForCell(row[header.value])"
       >
         <div v-if="!row[header.value]">
           <span @click.stop="handleCellClick(header.id, row.startTime, null)"></span>
         </div>
         <div v-else-if="row[header.value] && row[header.value] as SingleAppointment">
           <v-btn @click.stop="openSingleAppointmentDialog(row[header.value] as SingleAppointment)">
             {{ (row[header.value] as SingleAppointment).patient }}
           </v-btn>
         </div>
         <div v-else-if="row[header.value] && row[header.value] as AppointmentSeries">
           <v-btn @click.stop="openSeriesAppointmentDialog(row[header.value] as AppointmentSeries)">
             {{ (row[header.value] as AppointmentSeries).patient }} (Serie)
           </v-btn>
         </div>
       </td>
     </tr>
   </tbody>
 </v-table>

   <!-- Dialog für das Erstellen eines Termins -->
   <CreateAppointmentDialog
     v-if="createDialog"
     :currentDay="currentSingleDay"
     :appointment="initAppointment"
     v-model="createDialog"
     @saveSingle="addAppointment"
     @saveSeries="addSeriesAppointment"
     @cancel="createDialog = false"
   />

   <!-- Dialog für das Anzeigen und Bearbeiten eines Einzeltermins -->
   <SingleAppointmentDialog
     v-if="singleAppointmentDialog && selectedAppointment"
     :appointment="selectedAppointment"
     :currentDay="currentSingleDay"
     @save="changeSingleAppointment"
     @delete="deleteSingleAppointment"
     v-model="singleAppointmentDialog"
   />

   <!-- Dialog für das Anzeigen und Bearbeiten eines Serientermins -->
   <AppointmentSeriesDialog 
     v-if="seriesAppointmentDialog && selectedSeriesAppointment"
     :appointment="selectedSeriesAppointment"
     :currentDay="currentSingleDay"
     @save="changeSeriesAppointment"
     @delete="deleteSeriesAppointment"
     v-model="seriesAppointmentDialog"
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
import { useAbsenceStore } from '../store/AbsenceStore';
import Therapist from '@/class/Therapist';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import Absence from '@/class/Absence';
import Appointment from '@/class/Appointment';
import { useTherapistStore } from '@/store/TherapistStore';
import Patient from '@/class/Patient';

export default defineComponent({
  components: {
    CreateAppointmentDialog,
    SingleAppointmentDialog,
    AppointmentSeriesDialog,
  },
  props: {
    currentSingleDay: {
      type: Date,
      required: true,
    },
  },
  setup(props, { emit }) {
    const loading = ref(true);
    const createDialog = ref(false);
    const singleAppointmentDialog = ref(false);
    const seriesAppointmentDialog = ref(false);
    const selectedTherapist = ref<Therapist | null>(null);
    const selectedAppointment = ref<SingleAppointment | null>(null);
    const selectedSeriesAppointment = ref<AppointmentSeries | null>(null);
    const initAppointment = ref(SingleAppointment.createEmpty());

    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();
    const absenceStore = useAbsenceStore();
    const therapistStore = useTherapistStore();
    type AppointmentRow = Record<number, SingleAppointment | AppointmentSeries | null> & { startTime: Date };

    const headers = ref<{ id: number; text: string; value: number; therapist: Therapist }[]>([]);
    const rows = ref<AppointmentRow[]>([]);

    watch(() => props.currentSingleDay, async () => {
      await loadAppointments();
    });

    onMounted(() => {
      loadAppointments();
      loadTherapists();
    });

    const createHeaders = () => {
      const therapists: Therapist[] = therapistStore.getTherapists();
      headers.value = therapists.map(therapist => ({
          id: therapist.id,
          text: therapist.fullName,
          value: therapist.id,
          therapist: therapist
        }))
      ;
    };


    const loadAppointments = async () => {
      const date: string = props.currentSingleDay.toISOString();
      loading.value = true;
      await appointmentStore.loadAppointmentsForDate(date);
      await appointmentSeriesStore.loadAppointmentSeries();
      loading.value = false;
      //createRows();
    };

    const loadTherapists = async () => {
      loading.value = true;
      await therapistStore.loadTherapists();
      loading.value = false;
      createHeaders();
      createRows();
    };

    const createRows = () => {
      const startTimes: Date[] = [];
      let time = new Date();
      time.setHours(7, 0, 0, 0); // Startzeit 07:00

      while (time.getHours() < 22) { // Endzeit 22:00
        startTimes.push(new Date(time));
        time.setMinutes(time.getMinutes() + 10);
      }

      rows.value = startTimes.map((time) => {
        const row: Record<number, SingleAppointment | AppointmentSeries | null> = {};

        headers.value.forEach((header) => {
          const singleAppointment = appointmentStore.getAppointmentByTherapistAndTime(header.id, props.currentSingleDay, time);
          const seriesAppointment = appointmentSeriesStore.getAppointmentSeriesByTherapistAndTime(header.id, props.currentSingleDay, time);

          // Zuweisung für header.value als Key
          row[header.value] = singleAppointment || seriesAppointment || null;
        });

        return {
          ...row,
          startTime: time // Zeitstempel als zusätzliche Eigenschaft
        };
      });
    };

    const handleCellClick = (therapistId: number, startTime: Date, entry: SingleAppointment | AppointmentSeries | null) => {
      console.log(entry);
      console.log(therapistId);
      console.log(startTime);
      if (!entry) {
        openCreateDialog(therapistId, startTime);
      } else if (entry instanceof SingleAppointment) {
        openSingleAppointmentDialog(entry);
      }
    };

    const openCreateDialog = (id: number, startTime: Date) => {
      const therapist = therapistStore.getTherapists().find(t => t.id === id);
      if (therapist) {
        initAppointment.value = new SingleAppointment(
          0, // oder die korrekte ID
          therapist,
          therapist.id,
          Patient.createEmpty(), // leerer Patient oder der zugewiesene Patient
          0, // leerer Patient ID oder die korrekte ID
          startTime,
          new Date(startTime.getTime() + 20 * 60 * 1000), // Beispiel Endzeit, z.B. 1 Stunde später
          '',
          new Date(), // Beispiel für heutiges Datum
          false,
          false,
          false,
          false
        );
        createDialog.value = true;
      }
    };


    const openSingleAppointmentDialog = (appointment: SingleAppointment | AppointmentSeries | null) => {
      if (appointment instanceof SingleAppointment) {
        selectedAppointment.value = appointment;
        singleAppointmentDialog.value = true;
      }
    };


    const openSeriesAppointmentDialog = (appointment: AppointmentSeries) => {
      selectedSeriesAppointment.value = appointment;
      seriesAppointmentDialog.value = true;
    };

    const addAppointment = (appointment: SingleAppointment) => {
      appointmentStore.addAppointment(appointment);
      loadAppointments();
      createDialog.value = false;
    };

    const addSeriesAppointment = (appointment: AppointmentSeries) => {
      appointmentSeriesStore.addAppointmentSeries(appointment);
      loadAppointments();
    };

    const changeSingleAppointment = (appointment: SingleAppointment) => {
      appointmentStore.updateAppointment(appointment.id, appointment);
      loadAppointments();
    };

    const changeSeriesAppointment = (appointment: AppointmentSeries) => {
      appointmentSeriesStore.updateAppointmentSeries(appointment.id, appointment);
      loadAppointments();
    };

    const deleteSingleAppointment = (id: number) => {
      appointmentStore.deleteAppointment(id);
      loadAppointments();
    };

    const deleteSeriesAppointment = (id: number) => {
      appointmentSeriesStore.deleteAppointmentSeries(id);
      loadAppointments();
    };

    const getClassForCell = (entry: SingleAppointment | AppointmentSeries | null) => {
      if (!entry) return '';
      if (entry instanceof SingleAppointment) {
        return entry.isHotair ? 'cell-hotair' : entry.isUltrasonic ? 'cell-ultrasonic' : entry.isElectric ? 'cell-electric' : '';
      }
      if (entry instanceof AppointmentSeries) {
        return entry.isBWO ? 'cell-bwo' : '';
      }
      return '';
    };

    return {
      createDialog,
      singleAppointmentDialog,
      seriesAppointmentDialog,
      selectedTherapist,
      initAppointment,
      selectedAppointment,
      selectedSeriesAppointment,
      handleCellClick,
      headers,
      rows,
      loading,
      openCreateDialog,
      openSingleAppointmentDialog,
      openSeriesAppointmentDialog,
      addAppointment,
      addSeriesAppointment,
      changeSingleAppointment,
      changeSeriesAppointment,
      deleteSingleAppointment,
      deleteSeriesAppointment,
      getClassForCell,
    };
  },
});
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