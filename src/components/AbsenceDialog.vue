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
            <!-- Datum-Feld wird nur angezeigt, wenn keine wiederkehrende Abwesenheit -->
            <v-col v-if="!isReacurringAbsence">
              <div class="v-label">Datum</div>
              <VueDatePicker
                v-model="absence.date"
                @change="handleDateChange"
                text-input
                teleport-center
                :format="formatDate"
                :format-locale="de"
                :value="absence.date"
              />
            </v-col>
            <!-- Wochentag-Auswahl wird nur angezeigt, wenn es eine wiederkehrende Abwesenheit ist -->
            <v-col v-if="isReacurringAbsence">
              <v-select
                v-model="absence.weekday"
                :items="weekdays"
                label="Wochentag"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="v-label">Von</div>
              <VueDatePicker
                v-model="absence.startTime"
                @change="handleStartTimeChange"
                text-input
                teleport-center
                minutes-increment="10"
                :format="formatTime"
                :format-locale="de"
                :value="absence.startTime"
              />
            </v-col>
            <v-col>
              <div class="v-label">Bis</div>
              <VueDatePicker
                v-model="absence.endTime"
                @change="handleEndTimeChange"
                text-input
                teleport-center
                minutes-increment="10"
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
        <v-btn color="success" @click="saveAbsence">
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import Absence from '@/class/Absence';
import { de } from 'date-fns/locale';
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
    const formValid = ref(false);
    const weekdays = ['', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    const rules = {
      required: (value: any) => !!value || 'Dieses Feld ist erforderlich',
    };

    const editingAbsence = computed(() => !!props.absence);

    const absence = ref<Absence>({
      id: props.absence?.id || 0,
      therapistId: props.therapistId,
      date: props.absence?.date || null,
      weekday: props.absence?.weekday || null,
      startTime: props.absence?.startTime || new Date(),
      endTime: props.absence?.endTime || new Date(),
    });

    watch(
      () => props.absence,
      (newAbsence) => {  
        if (newAbsence) {
          isReacurringAbsence.value = newAbsence.date == null;
          absence.value = { ...newAbsence };
        }
      },
      { immediate: true }
    );
    

    const handleDateChange = (date: Date) => {
      absence.value.date = date;
    };

    const handleStartTimeChange = (time: Date) => {
      absence.value.startTime = time;
    };

    const handleEndTimeChange = (time: Date) => {
      absence.value.endTime = time;
    };

    const saveAbsence = () => {
      if (!(absence.value.date || absence.value.weekday)) {
        alert('Entweder ein Datum oder ein Wochentag muss gesetzt sein.');
        return;
      }
      emit('save', absence.value);
    };

    const deleteAbsence = () => {
      emit('delete', absence.value.id);
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
