<template>
  <v-dialog v-model="dialogOpen" max-width="500px">
    <v-card>
      <v-card-title>
        <span v-if="formData.id">Abwesenheit bearbeiten</span>
        <span v-else>Neue Abwesenheit hinzufügen</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-select
            v-model="formData.weekday"
            :items="weekdays"
            label="Wochentag"
            :rules="[v => !!v || 'Wochentag erforderlich']"
          ></v-select>

          <v-menu
            ref="startTimeMenu"
            v-model="startTimeMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formData.startTime"
                label="Startzeit"
                readonly
                v-bind="attrs"
                v-on="on"
                :rules="[v => !!v || 'Startzeit erforderlich']"
              ></v-text-field>
            </template>
            <v-time-picker
              v-if="startTimeMenu"
              v-model="formData.startTime"
              @change="startTimeMenu = false"
            ></v-time-picker>
          </v-menu>

          <v-menu
            ref="endTimeMenu"
            v-model="endTimeMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formData.endTime"
                label="Endzeit"
                readonly
                v-bind="attrs"
                v-on="on"
                :rules="[v => !!v || 'Endzeit erforderlich']"
              ></v-text-field>
            </template>
            <v-time-picker
              v-if="endTimeMenu"
              v-model="formData.endTime"
              @change="endTimeMenu = false"
            ></v-time-picker>
          </v-menu>

          <v-menu
            ref="dateMenu"
            v-model="dateMenu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formData.date"
                label="Datum (für spezifische Abwesenheiten)"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-if="dateMenu"
              v-model="formData.date"
              @change="dateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeDialog">Abbrechen</v-btn>
        <v-btn color="primary" @click="saveAbsence" :disabled="!valid">
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import Absence from '@/class/Absence';
import { Weekday } from '@/class/Enums';

export default defineComponent({
  props: {
    absence: {
      type: Object as () => Absence,
      required: true,
    },
    dialogOpen: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const formData = ref<Absence>(new Absence(0, new Date(), Weekday.MONDAY, new Date(), new Date()));
    const valid = ref(false);
    const weekdays = Object.values(Weekday);
    const startTimeMenu = ref(false);
    const endTimeMenu = ref(false);
    const dateMenu = ref(false);

    const initFormData = () => {
      formData.value = { ...props.absence };
    };

    const closeDialog = () => {
      emit('close');
    };

    const saveAbsence = () => {
      emit('save', formData.value);
    };

    watch(() => props.absence, initFormData, { immediate: true, deep: true });

    onMounted(initFormData);

    return {
      formData,
      valid,
      weekdays,
      startTimeMenu,
      endTimeMenu,
      dateMenu,
      closeDialog,
      saveAbsence,
    };
  },
});
</script>

<style scoped>
.v-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
