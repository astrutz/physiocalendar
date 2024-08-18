<template>
  <v-stepper v-model="currentStep" non-linear>
    <v-stepper-header>
      <v-stepper-step editable :complete="currentStep > 1" step="1" @click="resetSelectedAppointmentSuggestions()">
        Patientendaten eintragen
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step editable :complete="currentStep > 2" step="2">
        Verfügbaren Termin auswählen
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step step="3"> Auswahl bestätigen </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <v-combobox
          v-model="patientTextfield"
          :loading="patientsLoading"
          :items="foundPatients"
          :search-input.sync="searchValue"
          cache-items
          class="mb-4 mt-0"
          flat
          hide-no-data
          hide-details
          clearable
          label="Name des Patienten"
        ></v-combobox>
        <v-row class="pl-3">
          <v-select
            v-model="selectedTherapists"
            :items="therapists"
            placeholder="Therapeuten auswählen"
            clearable
            multiple
          >
            <template v-slot:label>
              <div>{{ label }}</div>
            </template>
            <template v-slot:prepend-item>
              <v-list-item ripple @click="toggleAllTherapists">
                <v-list-item-action>
                  <v-icon
                    :color="selectedTherapists.length > 0 ? 'indigo darken-4' : ''"
                  >
                    {{ icon }}
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Alle auswählen</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="mt-2"></v-divider>
            </template>
          </v-select>
        </v-row>
        <v-row class="pl-3">
          <v-col>
            <v-text-field
              label="Anzahl der Termine"
              v-model="appointmentCount"
              clearable
              type="number"
              max="40"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-select
              :items="availableAppoinmentLengths"
              label="Dauer der Termine"
              v-model="appointmentLength"
            >
            </v-select>
          </v-col>
        </v-row>
        <v-row class="pl-3 mt-6">
          <h3 style="color: black">Mögliche Termine (mindestens drei auswählen)</h3>
        </v-row>
        <v-row class="pl-3 mt-6 mb-3">
          <v-btn
            @click="toggleAllSlots()"
            :color="selectedAppointmentRequests.length === appointmentRequests.length ? '' : 'primary'"
          >
            Alle {{selectedAppointmentRequests.length === appointmentRequests.length ? 'abwählen' : 'auswählen'}}
          </v-btn>
        </v-row>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-icon style="float: right" v-bind="attrs" v-on="on" large>
              mdi-information
            </v-icon>
          </template>
          <span>
            Die Tageszeiten sind wie folgt definiert:
            <ul>
              <li>Morgen: 07:00 bis 10:00</li>
              <li>Vormittag: 10:00 bis 12:00</li>
              <li>Mittag: 12:00 bis 15:00</li>
              <li>Nachmittag: 15:00 bis 18:00</li>
              <li>Abend: 18:00 bis 20:00</li>
            </ul>
          </span>
        </v-tooltip>
        <v-row class="pl-3">
          <v-col cols="2">
            <v-checkbox
              v-for="request in appointmentRequests.filter(
                (req, i) => i % 5 === 0
              )"
              :key="`${request.weekday}-${request.timeOfDay}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request.weekday} ${request.timeOfDay}`"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="(request1, index) in appointmentRequests.filter((req, i) => i % 5 === 1)"
              :key="`request-${index}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request1.weekday} ${request1.timeOfDay}`"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="(request2, index) in appointmentRequests.filter((req, i) => i % 5 === 2)"
              :key="`request-${index}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request2.weekday} ${request2.timeOfDay}`"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="(request3, index) in appointmentRequests.filter((req, i) => i % 5 === 3)"
              :key="`request-${index}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request3.weekday} ${request3.timeOfDay}`"
            ></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-for="(request4, index) in appointmentRequests.filter((req, i) => i % 5 === 4)"
              :key="`request-${index}`"
              v-model="selectedAppointmentRequests"
              dense
              :label="`${request4.weekday} ${request4.timeOfDay}`"
            ></v-checkbox>
          </v-col>
        </v-row>

        <v-btn @click="resetFinder()" color="error"> Abbrechen </v-btn>
        <v-btn
          class="button-next"
          :disabled="
            patientTextfield === '' ||
            selectedTherapists.length === 0 ||
            selectedAppointmentRequests.length < 3 ||
            appointmentCount === 0
          "
          color="primary"
          @click="
            findAppointments();
            currentStep = 2;
          "
        >
          Fortfahren
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <div v-if="appointmentSuggestions.length > 0" style="overflow-y: scroll; overflow-x: hidden; max-height: 500px">
          <p class="pl-3">Folgende Termine stehen zur Auswahl: {{appointmentSuggestions.length}}</p>
          <v-row class="pl-3">
            <v-col
              v-for="suggestion in appointmentSuggestions"
              :key="`${suggestion.therapist}-${suggestion.date}-${suggestion.startTime}-${Math.random()}`"
              cols="4"
              style="padding: 0"
            >
              <v-checkbox
                :label="`${suggestion.therapist}, ${convertSuggestionDate(
                  suggestion.date
                )} um ${suggestion.startTime}`"
                :value="suggestion"
                :multiple="true"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row class="pl-3 mb-4">
            <strong
              >{{ selectedAppointmentSuggestions.length }} von
              {{ appointmentCount }} Terminen ausgewählt</strong
            >
          </v-row>
          <v-btn @click="resetFinder()" color="error"> Abbrechen </v-btn>
          <v-btn
            :disabled="
              selectedAppointmentSuggestions.length !==
              appointmentCount
            "
            class="button-next"
            color="primary"
            @click="currentStep = 3"
          >
            Termine auswählen
          </v-btn>
        </div>
        <div v-else>
          <p>
            Es wurde kein Termin gefunden. Bitte legen Sie manuell einen Termin
            über die Terminliste an.
          </p>
          <v-btn
            class="button-next"
            color="primary"
            button
            @click="resetFinder()
            "
          >
            Bestätigen
          </v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-content step="3">
        <p>Folgende Termine werden in der Terminliste gespeichert:</p>
        <p
          v-for="(suggestion, index) in selectedAppointmentSuggestions"
          :key="`${suggestion}-${index}`"
        >
          <strong>
            {{ suggestion.therapist }},
            {{ convertSuggestionDate(suggestion.date) }} um
            {{ suggestion.startTime }} ({{ appointmentLength }} Minuten)
          </strong>
        </p>
        <v-btn @click="resetFinder()" color="error"> Abbrechen </v-btn>
        <v-btn
          class="button-next"
          color="primary"
          @click="takeAppointmentSuggestion()"
        >
          Termin speichern
        </v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import AppointmentRequest from '@/class/AppointmentRequest';
import SingleAppointment from '@/class/SingleAppointment';
import Dateconversions from '@/class/Dateconversions';
import { useTherapistStore } from '@/store/TherapistStore';
import { usePatientStore } from '@/store/PatientStore';
import Patient from '@/class/Patient';

export default defineComponent({
  setup() {
    const patientTextfield = ref('');
    const patientId = ref('');
    const therapists = ref<string[]>([]);
    const selectedTherapists = ref<string[]>([]);
    const appointmentCount = ref(0);
    const appointmentLength = ref(20);
    const availableAppoinmentLengths = [
      { text: '10 Minuten', value: 10 },
      { text: '20 Minuten', value: 20 },
      { text: '30 Minuten', value: 30 },
      { text: '40 Minuten', value: 40 },
      { text: '50 Minuten', value: 50 },
      { text: '60 Minuten', value: 60 },
      { text: '70 Minuten', value: 70 },
      { text: '80 Minuten', value: 80 },
      { text: '90 Minuten', value: 90 },
      { text: '100 Minuten', value: 100 },
      { text: '110 Minuten', value: 110 },
      { text: '120 Minuten', value: 120 },
    ];

    const appointmentRequests = ref(AppointmentRequest.generateAll());
    const selectedAppointmentRequests = ref<AppointmentRequest[]>([]);
    const appointmentSuggestions = ref<SingleAppointment[]>([]);
    const selectedAppointmentSuggestions = ref<SingleAppointment[]>([]);
    const currentStep = ref(1);
    const patientsLoading = ref(false);
    const searchValue = ref('');
    const foundPatients = ref<Patient[]>([]);

    const therapistStore = useTherapistStore();
    const patientStore = usePatientStore();

    const loadTherapists = async () => {
      await therapistStore.loadTherapists();
      therapists.value = therapistStore.getAllTherapists.map(t => t.name);
    };

    const loadPatients = async () => {
      await patientStore.loadPatients();
    };

    const label = computed(() => {
      if (selectedTherapists.value.length === therapists.value.length) {
        return 'Alle Therapeuten ausgewählt';
      }
      if (selectedTherapists.value.length === 0) {
        return 'Therapeuten auswählen';
      }
      return `${selectedTherapists.value.length} Therapeuten ausgewählt`;
    });

    const icon = computed(() => {
      if (selectedTherapists.value.length === therapists.value.length) return 'mdi-close-box';
      if (selectedTherapists.value.length > 0) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    });

    watch(searchValue, async (val) => {
      foundPatients.value = [];
      patientTextfield.value = val || patientTextfield.value;
      await searchPatients(val);
    });

    const toggleAllSlots = () => {
      if (selectedAppointmentRequests.value.length === appointmentRequests.value.length) {
        selectedAppointmentRequests.value = [];
      } else {
        selectedAppointmentRequests.value = appointmentRequests.value.slice();
      }
    };

    const toggleAllTherapists = () => {
      if (selectedTherapists.value.length === therapists.value.length) {
        selectedTherapists.value = [];
      } else {
        selectedTherapists.value = therapists.value.slice();
      }
    };

    const convertSuggestionDate = (date: Date) => {
      return Dateconversions.convertDateToReadableString(date);
    };

    const findAppointments = () => {
      // Logik, um verfügbare Termine basierend auf den Auswahlkriterien zu finden.
    };

    const resetSelectedAppointmentSuggestions = () => {
      selectedAppointmentSuggestions.value = [];
    };

    const resetFinder = () => {
      currentStep.value = 1;
      patientTextfield.value = '';
      selectedTherapists.value = [];
      selectedAppointmentRequests.value = [];
      selectedAppointmentSuggestions.value = [];
      appointmentSuggestions.value = [];
      appointmentCount.value = 0;
      // this.$emit('dialogClosed'); // use if necessary
    };

    const takeAppointmentSuggestion = () => {
      // Logik, um die ausgewählten Termine zu speichern.
      resetFinder();
    };

    const searchPatients = async (searchQuery: string | undefined) => {
      if (searchQuery && searchQuery.length > 2) {
        patientsLoading.value = true;
        foundPatients.value = patientStore.findPatientsByName(searchQuery);
        patientsLoading.value = false;
      }
    };

    loadTherapists();
    loadPatients();

    return {
      patientTextfield,
      patientId,
      therapists,
      selectedTherapists,
      appointmentCount,
      appointmentLength,
      availableAppoinmentLengths,
      appointmentRequests,
      selectedAppointmentRequests,
      appointmentSuggestions,
      selectedAppointmentSuggestions,
      currentStep,
      patientsLoading,
      searchValue,
      foundPatients,
      loadTherapists,
      loadPatients,
      label,
      icon,
      toggleAllSlots,
      toggleAllTherapists,
      convertSuggestionDate,
      findAppointments,
      resetSelectedAppointmentSuggestions,
      resetFinder,
      takeAppointmentSuggestion,
      searchPatients,
    };
  },
});
</script>

<style scoped>
.button-next {
  float: right;
}
</style>
