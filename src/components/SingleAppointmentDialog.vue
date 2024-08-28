<template>
  <v-dialog persistent v-model="dialogIsOpen" width="800">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Einzeltermin - {{ appointment.therapist.name }} - {{ currentDay }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-combobox
          v-model="appointment.patient.lastName"
          :items="foundPatients"
          :search-input.sync="searchValue"
          @input="searchPatients"
          label="Name des Patienten"
          clearable
        ></v-combobox>

        <v-text-field
          label="Sonstige Bemerkungen"
          v-model="appointment.comment"
          clearable
        ></v-text-field>

        <v-row>
          <v-col>
            <v-checkbox label="Heißluft" v-model="appointment.isHotair"></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox label="Ultraschall" v-model="appointment.isUltrasonic"></v-checkbox>
          </v-col>
          <v-col>
            <v-checkbox label="Elektro" v-model="appointment.isElectric"></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="normal"  @click="closeDialog">Abbrechen</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="saveAppointment">Speichern</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import SingleAppointment from '@/class/SingleAppointment';
import Dateconversions from '@/class/Dateconversions';

export default defineComponent({
  props: {
    currentDay: {
      type: Date,
      required: true,
    },
    appointment: {
      type: Object as () => SingleAppointment,
      required: true,
    },
  },
  setup(props, { emit }) {
    const dialogIsOpen = ref(false);
    const searchValue = ref('');
    const appointment = ref<SingleAppointment>(props.appointment);

    const times = Dateconversions.getAllTimes();

    const foundPatients = computed(() => {
      // Implementiere die Logik zur Suche von Patienten
      return [];
    });

    const searchPatients = (query: string) => {
      // Implementiere die Patientensuche
    };

    const saveAppointment = () => {
      emit('save', appointment.value);
      closeDialog();
    };

    const closeDialog = () => {
      dialogIsOpen.value = false;
    };

    watch(
      () => props.appointment,
      (newAppointment) => {
        initializeAppointment(newAppointment);
      },
      { immediate: true, deep: true }
    );

    const initializeAppointment = (newAppointment: SingleAppointment) => {
      appointment.value = newAppointment;
    };

    return {
      dialogIsOpen,
      searchValue,
      times,
      appointment,
      foundPatients,
      searchPatients,
      saveAppointment,
      closeDialog,
    };
  },
});
</script>
