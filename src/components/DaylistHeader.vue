<template>
  <div class="daylist-header">
    <v-card class="mb-2" outlined>
      <v-card-title>
        <span>{{ therapist.name }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="openAbsenceDialog">
          <v-icon>mdi-calendar-remove</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-subtitle>Generelle Abwesenheiten (Wochentage)</v-card-subtitle>
      <v-list dense>
        <v-list-item v-for="absence in weekdayAbsences" :key="absence.id">
          <v-list-item-content>
            <v-list-item-title>{{ formatWeekday(absence.weekday) }}: {{ formatTimeRange(absence.startTime, absence.endTime) }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="editAbsence(absence)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="deleteAbsence(absence)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-card-subtitle>Ausnahmen (Spezifische Tage)</v-card-subtitle>
      <v-list dense>
        <v-list-item v-for="exception in specificDateAbsences" :key="exception.id">
          <v-list-item-content>
            <v-list-item-title>{{ formatDate(exception.date) }}: {{ formatTimeRange(exception.startTime, exception.endTime) }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="editAbsence(exception)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="deleteAbsence(exception)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Dialog für das Hinzufügen/Bearbeiten von Abwesenheiten -->
    <AbsenceDialog
      v-if="absenceDialogOpen"
      :absence="selectedAbsence"
      @save="saveAbsence"
      @close="closeAbsenceDialog"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import AbsenceDialog from './AbsenceDialog.vue';
import { useAbsenceStore } from '@/store/AbsenceStore';
import Absence from '@/class/Absence';
import Therapist from '@/class/Therapist';
import { Weekday } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';
import { TimeUtils } from '@/class/TimeUtils';

export default defineComponent({
  components: {
    AbsenceDialog,
  },
  props: {
    therapist: {
      type: Object as () => Therapist,
      required: true,
    },
  },
  setup(props) {
    const absenceDialogOpen = ref(false);
    const selectedAbsence = ref<Absence | null>(null);
    const absences = ref<Absence[]>([]);

    const absenceStore = useAbsenceStore();

    onMounted(async () => {
      await loadAbsences();
    });

    const loadAbsences = async () => {
      await absenceStore.loadAbsences(props.therapist.id);
      absences.value = absenceStore.getAllAbsences;
    };

    const weekdayAbsences = computed(() =>
      absences.value.filter(absence => absence.weekday !== null && absence.date === null)
    );

    const specificDateAbsences = computed(() =>
      absences.value.filter(absence => absence.date !== null)
    );

    const formatWeekday = (weekday: Weekday): string => {
      switch (weekday) {
        case Weekday.MONDAY:
          return 'Montag';
        case Weekday.TUESDAY:
          return 'Dienstag';
        case Weekday.WEDNESDAY:
          return 'Mittwoch';
        case Weekday.THURSDAY:
          return 'Donnerstag';
        case Weekday.FRIDAY:
          return 'Freitag';
        default:
          return '';
      }
    };

    const formatDate = (date: Date): string => {
      return Dateconversions.convertDateToReadableString(date);
    };

    const formatTimeRange = (startTime: Date, endTime: Date): string => {
      return TimeUtils.formatTimeRange(startTime, endTime);
    };

    const openAbsenceDialog = () => {
      selectedAbsence.value = new Absence(0, new Date(), Weekday.MONDAY, new Date(), new Date());
      absenceDialogOpen.value = true;
    };

    const closeAbsenceDialog = () => {
      absenceDialogOpen.value = false;
    };

    const saveAbsence = async (absence: Absence) => {
      if (absence.id) {
        await absenceStore.updateAbsence(props.therapist.id, absence);
      } else {
        await absenceStore.addAbsence(props.therapist.id, absence);
      }
      closeAbsenceDialog();
      await loadAbsences();
    };

    const deleteAbsence = async (absence: Absence) => {
      await absenceStore.deleteAbsence(props.therapist.id, absence.id);
      await loadAbsences();
    };

    const editAbsence = (absence: Absence) => {
      selectedAbsence.value = absence;
      absenceDialogOpen.value = true;
    };

    return {
      absenceDialogOpen,
      selectedAbsence,
      absences,
      weekdayAbsences,
      specificDateAbsences,
      formatWeekday,
      formatDate,
      formatTimeRange,
      openAbsenceDialog,
      closeAbsenceDialog,
      saveAbsence,
      deleteAbsence,
      editAbsence,
    };
  },
});
</script>

<style scoped>
.daylist-header {
  padding: 16px;
}
</style>
