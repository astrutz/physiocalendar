<template>
  <v-dialog v-model="dialogVisible" max-width="1500px">
    <v-card>
      <v-card-title>
        {{ editingAbsence ? 'Abwesenheit bearbeiten' : 'Abwesenheit hinzufügen' }}
      </v-card-title>
      <v-card-text>
        <v-form ref="absenceForm" v-model="formValid">
          <v-row>
            <v-col>
              <VueDatePicker
                v-model="absence.date"
                @change="handleDateChange"
                text-input
                :format="formatDate"
                :format-locale="de"
                :value="absence.date"
              />
            </v-col>
            <v-col>
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
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog">Abbrechen</v-btn>
        <v-btn
          color="primary"
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
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const store = useAbsenceStore();
    const formValid = ref(false);
    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    const rules = {
      required: (value: any) => !!value || 'Dieses Feld ist erforderlich',
    };

    const editingAbsence = computed(() => !!props.absence);

    const absence = computed(() => {
      return props.absence ? { ...props.absence } : new Absence(1, new Date(), Weekday.MONDAY, new Date(), new Date());
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
        await store.updateAbsence(props.therapistId, absence.value);
      } else {
        await store.addAbsence(props.therapistId, absence.value);
      }
      emit('update:dialogVisible', false);
    };

    const closeDialog = () => {
      emit('update:dialogVisible', false);
    };

    return {
      formValid,
      weekdays,
      absence,
      rules,
      editingAbsence,
      formatDate,
      formatTime,
      handleDateChange,
      handleStartTimeChange,
      handleEndTimeChange,
      saveAbsence,
      closeDialog,
      de,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
