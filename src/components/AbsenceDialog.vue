<template>
  <v-dialog v-model="dialogIsOpen" max-width="800px">
    <v-card>
      <v-card-title>
        <v-row>
          <v-col>
            {{ editingAbsence ? 'Abwesenheit bearbeiten' : 'Abwesenheit hinzufügen' }}
          </v-col>
          <v-col cols="auto">
            <v-switch v-model="isReacurringAbsence" label="Wöchentliche Abwesenheit"></v-switch>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-form ref="absenceForm" v-model="formValid">
          <v-row>
            <v-col v-if="!isReacurringAbsence">
              <div class="v-label">Datum</div>
              <VueDatePicker
                v-model="absence.date"
                @change="handleDateChange"
                text-input
                :format="formatDate"
                :format-locale="de"
                :value="absence.date"
              />
            </v-col>
            <v-col v-if="isReacurringAbsence">
              <v-select
                v-model="absence.weekday"
                :items="weekdays"
                label="Wochentag"
                :rules="[rules.required]"
              />
            </v-col>
            
          </v-row>
            <v-row>
              <v-col>
              <div class="v-label">Von</div>
              <VueDatePicker
                time-picker
                v-model="absence.startTime"
                @change="handleStartTimeChange"
                text-input
                :format="formatTime"
                :format-locale="de"
                :value="absence.startTime"
              />
            </v-col>
            <v-col>
              <div class="v-label">Bis</div>
              <VueDatePicker
                time-picker
                v-model="absence.endTime"
                @change="handleEndTimeChange"
                text-input
                :format="formatTime"
                :format-locale="de"
                :value="absence.endTime"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeDialog">Abbrechen</v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="absence.id" color="error" @click="deleteAbsence">Abwesenheit löschen</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="success"
          @click="saveAbsence"
          :disabled="!formValid"
        >
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import Absence from '@/class/Absence';
import { de } from 'date-fns/locale';
import { useAbsenceStore } from '@/store/AbsenceStore';
import { Weekday } from '@/class/Enums';
import { formatDate, formatTime } from '@/class/Dateconversions';

export default defineComponent({
  name: 'AbsenceDialog',
  props: {
    therapistId: {
      type: Number,
      required: true,
    },
    absence: {
      type: Object as () => Absence | null,
      default: null,
    },
  },
  setup(props, { emit }) {
    const dialogIsOpen = ref(false);
    const isReacurringAbsence = ref(false);
    const absenceStore = useAbsenceStore();
    const formValid = ref(false);
    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    const rules = {
      required: (value: any) => !!value || 'Dieses Feld ist erforderlich',
    };

    const editingAbsence = computed(() => !!props.absence);

    const absence = computed(() => {
      return props.absence ? { ...props.absence } : new Absence(1, props.therapistId, new Date(), Weekday.MONDAY, new Date(), new Date());
    });

    const handleDateChange = (date: Date) => {
      if (absence.value) {
        absence.value.date = date;
      }
    };

    const handleStartTimeChange = (time: Date) => {
      if (absence.value) {
        absence.value.startTime = time;
      }
    };

    const handleEndTimeChange = (time: Date) => {
      if (absence.value) {
        absence.value.endTime = time;
      }
    };

    const saveAbsence = async () => {
      if (!absence.value) return;

      if (!(absence.value.date || absence.value.weekday)) {
        alert('Entweder ein Datum oder ein Wochentag muss gesetzt sein.');
        return;
      }

      if (editingAbsence.value) {
        emit('save', absence.value);
      }
      else {
        await absenceStore.addAbsence(absence.value.therapistId, absence.value);
      }
    };

    const deleteAbsence = () => {
      emit('delete', absence.value);
    };

    const closeDialog = () => {
      emit('cancel');
    };

    return {
      formValid,
      weekdays,
      absence,
      rules,
      editingAbsence,
      dialogIsOpen,
      formatDate,
      formatTime,
      handleDateChange,
      handleStartTimeChange,
      handleEndTimeChange,
      saveAbsence,
      deleteAbsence,
      closeDialog,
      isReacurringAbsence,
      de,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
