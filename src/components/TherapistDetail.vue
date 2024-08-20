<template>
  <v-card>
    <v-card-title class="text-h5 d-flex justify-space-between">
      Therapist bearbeiten
      <v-btn icon @click="cancelChanges">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text v-if="therapistInput">
      <v-row>
        <v-col>
          <v-text-field label="Name" v-model="therapistInput.name" clearable></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <VueDatePicker
            v-model="therapistInput.activeSince"
            @change="handleDateSinceChange"
            text-input
            :format="formatDate"
            :format-locale="de"
          />
        </v-col>
        <v-col>
          <VueDatePicker
            v-model="therapistInput.activeUntil"
            @change="handleDateUntilChange"
            :format="formatDate"
            :format-locale="de"
          />
        </v-col>
      </v-row>
      <v-spacer></v-spacer>
      <!-- Tab Selector -->
      <v-tabs v-model="activeTab">
        <v-tab>Einzeltermine</v-tab>
        <v-tab>Serientermine</v-tab>
        <v-tab>Abwesenheiten</v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
      <v-tabs-items v-model="activeTab">
        <!-- Einzeltermine -->
        <v-tab-item v-if="activeTab === 0">
          <v-row>
            <v-data-table
              :headers="appointmentHeaders"
              :items="appointments"
              item-key="id"
              :loading="loadingAppointments"
              :loading-text="'Laden...'"
            >
              <template #item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template #item.startTime="{ item }">
                {{ formatTime(item.startTime) }}
              </template>
              <template #item.endTime="{ item }">
                {{ formatTime(item.endTime) }}
              </template>
              <template #item.therapist="{ item }">
                {{ item.therapist.name }}
              </template>
            </v-data-table>
          </v-row>
        </v-tab-item>

        <!-- Serientermine -->
        <v-tab-item v-if="activeTab === 1">
          <v-row>
            <v-data-table
              :headers="appointmentSeriesHeaders"
              :items="appointmentSeries"
              item-key="id"
              :loading="loadingSeries"
              :loading-text="'Laden...'"
            >
              <template #item.weekday="{ item }">
                {{ item.weekday }}
              </template>
              <template #item.startTime="{ item }">
                {{ formatTime(item.startTime) }}
              </template>
              <template #item.endTime="{ item }">
                {{ formatTime(item.endTime) }}
              </template>
              <template #item.startDate="{ item }">
                {{ formatDate(item.startDate) }}
              </template>
              <template #item.endDate="{ item }">
                {{ formatDate(item.endDate) }}
              </template>
              <template #item.weeklyFrequency="{ item }">
                {{ item.weeklyFrequency }}
              </template>
              <template #item.therapist="{ item }">
                {{ item.therapist.name }}
              </template>
            </v-data-table>
          </v-row>
        </v-tab-item>

        <!-- Abwesenheiten -->
        <v-tab-item v-if="activeTab === 2">
          <v-row>
            <v-data-table
              :headers="absenceHeaders"
              :items="absences"
              item-key="id"
              :loading="loadingAbsences"
              :loading-text="'Laden...'"
            >
              <template #item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template #item.startTime="{ item }">
                {{ formatTime(item.startTime) }}
              </template>
              <template #item.endTime="{ item }">
                {{ formatTime(item.endTime) }}
              </template>
              <template #item.weekday="{ item }">
                {{ item.weekday }}
              </template>
              <template #item.actions="{ item }">
                <v-btn icon @click="editAbsence(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="deleteAbsence(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
            <v-btn color="green" @click="openAddAbsenceDialog">
              <v-icon color="white">mdi-plus</v-icon>
              Abwesenheit hinzufügen
            </v-btn>
          </v-row>
        </v-tab-item>

        <v-tab-item v-if="activeTab === 3">
          <v-row>
            <v-data-table
              :headers="absenceHeaders"
              :items="absences"
              item-key="id"
              :loading="loadingAbsences"
              :loading-text="'Laden...'"
            >
              <template #item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
              <template #item.startTime="{ item }">
                {{ formatTime(item.startTime) }}
              </template>
              <template #item.endTime="{ item }">
                {{ formatTime(item.endTime) }}
              </template>
              <template #item.weekday="{ item }">
                {{ item.weekday }}
              </template>
              <template #item.actions="{ item }">
                <v-btn icon @click="editAbsence(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="deleteAbsence(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
            <v-btn color="green" @click="openAddAbsenceDialog">
              <v-icon color="white">mdi-plus</v-icon>
              Abwesenheit hinzufügen
            </v-btn>
          </v-row>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
    <v-card-actions>
      <v-btn color="grey" @click="cancelChanges">Abbrechen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="deleteTherapist">Therapist löschen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="green" @click="saveChanges">Speichern</v-btn>
    </v-card-actions>
    <AbsenceDialog
      :dialogVisible="isAbsenceDialogVisible"
      :therapistId="therapistId"
      :absence="absenceInput"
      @update:dialogVisible="isAbsenceDialogVisible = $event"
    />
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useAppointmentSeriesStore } from '@/store/AppointmentSeriesStore';
import { useTherapistStore } from '@/store/TherapistStore';
import { de } from 'date-fns/locale';
import Therapist from '@/class/Therapist';
import Absence from '@/class/Absence';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import { useAbsenceStore } from '@/store/AbsenceStore';
import AbsenceDialog from './AbsenceDialog.vue';
import { Weekday } from '@/class/Enums';

export default defineComponent({
  components: {
    AbsenceDialog,
  },
  props: {
    therapistId: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const therapistInput = ref<Therapist | undefined>(undefined);
    const appointments = ref<SingleAppointment[]>([]);
    const appointmentSeries = ref<AppointmentSeries[]>([]);
    const loadingAppointments = ref(true);
    const loadingSeries = ref(true);
    const loadingAbsences = ref(true);
    const absences = ref<Absence[]>([]);
    const activeTab = ref(0);
    const isAbsenceDialogVisible = ref(false);
    const editingAbsence = ref<Absence | null>(null);
    const absenceInput = ref<Absence | null>(null);


    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const formatTime = (date: Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const appointmentHeaders = ref([
      { title: 'Datum', value: 'date', sortable: true },
      { title: 'Von', value: 'startTime', sortable: true },
      { title: 'Bis', value: 'endTime', sortable: true },
      { title: 'Therapeut', value: 'therapist', sortable: true },
      { title: 'Kommentar', value: 'comment', sortable: true },
    ]);

    const appointmentSeriesHeaders = ref([
      { title: 'Wochentag', value: 'weekday', sortable: true },
      { title: 'Von', value: 'startTime', sortable: true },
      { title: 'Bis', value: 'endTime', sortable: true },
      { title: 'Start Datum', value: 'startDate', sortable: true },
      { title: 'End Datum', value: 'endDate', sortable: true },
      { title: 'Kommentar', value: 'comment', sortable: true },
      { title: 'Interval', value: 'weeklyFrequency', sortable: true },
    ]);

    const absenceHeaders = ref([
      { title: 'Datum', value: 'date', sortable: true },
      { title: 'Wochentag', value: 'weekday', sortable: true },
      { title: 'Von', value: 'startTime', sortable: true },
      { title: 'Bis', value: 'endTime', sortable: true },
    ]);

    const therapistStore = useTherapistStore();
    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();
    const absenceStore = useAbsenceStore();

    const loadAppointments = async () => {
      loadingAppointments.value = true;
      appointments.value = await appointmentStore.getAppointmentsByTherapistId(props.therapistId);
      loadingAppointments.value = false;
    };

    const loadAppointmentSeries = async () => {
      loadingSeries.value = true;
      await appointmentSeriesStore.loadAppointmentSeries();
      appointmentSeries.value = await appointmentSeriesStore.getAppointmentSeriesByTherapistId(props.therapistId);
      loadingSeries.value = false;
    };

    const loadAbsences = async () => {
      loadingAbsences.value = true;
      await absenceStore.loadAbsences(props.therapistId);
      absences.value = await absenceStore.getAbsencesForTherapist();
      loadingAbsences.value = false;
    };

    onMounted(async () => {
      therapistInput.value = await therapistStore.getTherapistById(props.therapistId);
      await loadAppointments();
      await loadAppointmentSeries();
      await loadAbsences();
      //
    });

    const handleDateSinceChange = (date: Date) => {
      if (therapistInput.value) {
        therapistInput.value.activeSince = date;
      }
    };

    const handleDateUntilChange = (date: Date) => {
      if (therapistInput.value) {
        therapistInput.value.activeUntil = date;
      }
    }

    const cancelChanges = () => {
      emit('cancel');
    };

    const saveChanges = () => {
      if (therapistInput.value) {
        emit('save', { therapist: therapistInput.value });
      }
    };

    const deleteTherapist = () => {
      if (therapistInput.value) {
        emit('deleteTherapist', { therapist: therapistInput.value });
      }
    };

    const openAddAbsenceDialog = () => {
      absenceInput.value = {
        id: 0,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        weekday: Weekday.MONDAY,
      };
      isAbsenceDialogVisible.value = true;
    };

    const closeAddAbsenceDialog = () => {
      isAbsenceDialogVisible.value = false;
    };

    const openAbsenceDialog = () => {
      absenceInput.value = null;
      isAbsenceDialogVisible.value = true;
    };

    const editAbsence = (absence: Absence) => {
      absenceInput.value = absence;
      isAbsenceDialogVisible.value = true;
    };

    const deleteAbsence = async (absenceId: number) => {
      await absenceStore.deleteAbsence(props.therapistId, absenceId);
    };

    return {
      therapistInput,
      de,
      appointments,
      appointmentSeries,
      absences,
      loadingAppointments,
      appointmentHeaders,
      appointmentSeriesHeaders,
      absenceHeaders,
      loadingSeries,
      loadingAbsences,
      activeTab,
      isAbsenceDialogVisible,
      editingAbsence,
      absenceInput,
      formatDate,
      formatTime,
      cancelChanges,
      saveChanges,
      deleteTherapist,
      openAddAbsenceDialog,
      closeAddAbsenceDialog,
      handleDateSinceChange,
      handleDateUntilChange,
      openAbsenceDialog,
      editAbsence,
      deleteAbsence,
    };
  },
});
</script>

<style scoped>
.series-appointment {
  background-color: #34d685;
}

.single-appointment {
  background-color: #ffffff;
}
</style>
