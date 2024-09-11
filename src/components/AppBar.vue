<template>
  <v-app-bar color="#2a2f79" dark>
    <img src="@/assets/icon-inverted.png" height="50px" class="mr-4" />
    <div class="d-flex align-center">
      <h1 class="text-h4">Physiokalender - Praxis Meyer 2.0</h1>
    </div>
    <v-spacer></v-spacer>
    <v-text-field
      hide-details
      append-icon="mdi-magnify"
      single-line
      v-model="searchTextfield"
      @click:prepend="search"
      @keydown.enter="search"
    ></v-text-field>
    <v-dialog v-model="showDialog" max-width="600px" persistent scrollable>
      <v-card>
        <v-card-title>Suchergebnisse</v-card-title>
        <v-card-text>
          <!-- Tab Selector for Single and Series Appointments -->
          <v-tabs v-model="activeTab">
            <v-tab>Einzeltermine</v-tab>
            <v-tab>Serientermine</v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeTab">
            <!-- Einzeltermine Results -->
            <v-tab-item v-if="activeTab === 0">
              <ul class="search-results-list" v-if="singleAppointmentsSearchResults.length > 0">
                <li v-for="(result, i) in singleAppointmentsSearchResults" :key="`${result.id}-${i}`">
                  <v-btn @click="navigateTargetDate(result.startTime)" class="search-result-btn">
                    <strong>{{ result.patient.fullName }}: </strong>
                    {{ getReadableDate(result.startTime) }},
                    {{ formatTime(result.startTime) }} bis {{ formatTime(result.endTime) }} bei {{ result.therapist.firstName }}
                  </v-btn>
                </li>
              </ul>
              <p v-else>Keine Einzeltermine gefunden.</p>
            </v-tab-item>

            <!-- Serientermine Results -->
            <v-tab-item v-if="activeTab === 1">
              <ul class="search-results-list" v-if="seriesAppointmentsSearchResults.length > 0">
                <li v-for="(result, i) in seriesAppointmentsSearchResults" :key="`${result.id}-${i}`">
                  <v-btn @click="showAppointmentSeriesDialog(result)" class="search-result-btn">
                    <strong>{{ result.patient.fullName }}: </strong>
                    {{ result.weekday }}s von,
                    {{  formatTime(result.startTime) }} bis {{ formatTime(result.endTime) }} bei {{ result.therapist.firstName }}
                  </v-btn>
                </li>
              </ul>
              <p v-else>Keine Serientermine gefunden.</p>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeDialog">Schließen</v-btn>
        </v-card-actions>
      </v-card>
      <AppointmentSeriesDialog
       v-if="selectedAppointmentSeries"
      :currentDay="new Date()"
      :appointment.sync="selectedAppointmentSeries"
      v-model="appointmentSeriesDialog"
      @saveSeries="changeSeriesAppointment"
      @deleteSeries="deleteSeriesAppointment"
      @cancel="appointmentSeriesDialog = false"
    />
    </v-dialog>
    <Menu />
    <v-menu v-model="userMenuOpen" offset-y>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title>
            <v-icon>mdi-account</v-icon>
            {{ user?.username }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>
            <v-icon>mdi-logout</v-icon> Logout
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="changePassword">
          <v-list-item-title>
            <v-icon>mdi-key</v-icon> Passwort ändern
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Menu from '@/components/Menu.vue';
import { useAppointmentStore } from '@/store/AppointmentStore';
import { useAppointmentSeriesStore } from '@/store/AppointmentSeriesStore';
import { formatTime, convertDateToReadableString } from '@/class/Dateconversions';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import EventBus from '@/class/EventBus';
import { useAuthStore } from '@/store/authStore';
import AppointmentSeriesDialog from './AppointmentSeriesDialog.vue';
import { format } from 'date-fns';

export default defineComponent({
  components: {
    Menu,
    AppointmentSeriesDialog,
  },
  setup() {
    const searchTextfield = ref('');
    const showDialog = ref(false);
    const appointmentSeriesDialog = ref(false);
    const singleAppointmentsSearchResults = ref<Array<SingleAppointment>>([]);
    const seriesAppointmentsSearchResults = ref<Array<AppointmentSeries>>([]);
    const userMenuOpen = ref(false);
    const activeTab = ref(0); // 0 for SingleAppointments, 1 for SeriesAppointments
    const selectedAppointmentSeries = ref<AppointmentSeries | null>(null);

    const appointmentStore = useAppointmentStore();
    const appointmentSeriesStore = useAppointmentSeriesStore();
    const authStore = useAuthStore();

    const user = computed(() => authStore.user);

    const logout = () => {
      authStore.logout();
    };

    const changePassword = () => {
      // TODO: Implementiere die Logik zum Ändern des Passworts
    };

    const search = async () => {
      await appointmentStore.loadAppointments();
      await appointmentSeriesStore.loadAppointmentSeries();

      singleAppointmentsSearchResults.value = [];
      seriesAppointmentsSearchResults.value = [];
      if (searchTextfield.value.length > 1) {
        const searchText = searchTextfield.value.toLowerCase();

        const singleAppointments: SingleAppointment[] = appointmentStore.getAllAppointments.filter(
          (appointment: SingleAppointment) => appointment.patient?.fullName.toLowerCase().includes(searchText)
        );

        const seriesAppointments: AppointmentSeries[] = appointmentSeriesStore.getAllAppointmentSeries.filter(
          (appointment: AppointmentSeries) => appointment.patient?.fullName.toLowerCase().includes(searchText)
        );

        singleAppointmentsSearchResults.value = [...singleAppointments];
        singleAppointmentsSearchResults.value.sort((a, b) => {
          const dateA = a.startTime;
          const dateB = b.startTime;
          return dateA.getTime() - dateB.getTime();
        });

        seriesAppointmentsSearchResults.value = [...seriesAppointments];
        seriesAppointmentsSearchResults.value.sort((a, b) => {
          const dateA = a.startTime;
          const dateB = b.startTime;
          return dateA.getTime() - dateB.getTime();
        });

        showDialog.value = true; // Dialog öffnen
      }
    };

    const closeDialog = () => {
      singleAppointmentsSearchResults.value = [];
      seriesAppointmentsSearchResults.value = [];
      searchTextfield.value = '';
      showDialog.value = false;
    };

    const showAppointmentSeriesDialog = (appointmentSeries: AppointmentSeries) => {
      selectedAppointmentSeries.value = appointmentSeries;
      appointmentSeriesDialog.value = true;
    };

    const navigateTargetDate = (newDate: Date) => {
      EventBus.set('currentDayChanged1', newDate);
      closeDialog(); // Dialog schließen nach Auswahl
    };

    const getReadableDate = (date: Date) => {
      return convertDateToReadableString(date);
    };

    const changeSeriesAppointment = (appointment: AppointmentSeries) => {
      appointmentSeriesStore.updateAppointmentSeries(appointment.id, appointment);
      closeDialog();
      appointmentSeriesDialog.value = false;
    };

    const deleteSeriesAppointment = (appointment: AppointmentSeries) => {
      appointmentSeriesStore.deleteAppointmentSeries(appointment.id);
      appointmentSeriesDialog.value = false;
      closeDialog();
    };

    return {
      userMenuOpen,
      user,
      logout,
      changePassword,
      searchTextfield,
      showDialog,
      singleAppointmentsSearchResults,
      seriesAppointmentsSearchResults,
      selectedAppointmentSeries,
      showAppointmentSeriesDialog,
      appointmentSeriesDialog,
      changeSeriesAppointment,
      deleteSeriesAppointment,
      formatTime,
      search,
      closeDialog,
      navigateTargetDate,
      getReadableDate,
      activeTab,
    };
  },
});
</script>
