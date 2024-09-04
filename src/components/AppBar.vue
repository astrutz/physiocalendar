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
    <v-dialog
      v-model="showDialog"
      max-width="600px"
      persistent
      scrollable
    >
      <v-card>
        <v-card-title>Suchergebnisse</v-card-title>
        <v-card-text>
          <ul class="search-results-list" v-if="searchResults.length > 0">
            <li v-for="(result, i) in searchResults" :key="`${result.id}-${i}`">
              <v-btn @click="navigateTargetDate(result.date)" class="search-result-btn">
                <strong>{{ result.patient.fullName }}: </strong>
                {{ getReadableDate(result.startTime) }},
                {{ result.startTime.toLocaleTimeString() }} bis {{ result.endTime.toLocaleTimeString() }} bei {{ result.therapist.firstName }}
                
              </v-btn>
            </li>
          </ul>
          <p v-else>Keine Termine gefunden.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeDialog">Schließen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Menu
    />
     <!-- Benutzer-Menü -->
     <v-menu 
     v-model="userMenuOpen" 
     offset-y
     >
      <template  v-slot:activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-icon> 
            mdi-account
          </v-icon>
        </v-btn>
      </template>
      
      <v-list>
        <v-list-item>
          <v-list-item-title>
            <v-icon> 
            mdi-account
          </v-icon>
          TODO Username</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>
            <v-icon> 
            mdi-logout
          </v-icon> Logout</v-list-item-title>
        </v-list-item>
        <v-list-item @click="changePassword">
          <v-list-item-title>
            <v-icon> 
            mdi-key
          </v-icon>
           Change Password</v-list-item-title>
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
import Dateconversions from '@/class/Dateconversions';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import EventBus from '@/class/EventBus';
import { useAuthStore } from '@/store/authStore';

export default defineComponent({
  components: {
    Menu,
  },
  setup() {
    const searchTextfield = ref('');
    const showDialog = ref(false);
    const searchResults = ref<Array<SingleAppointment>>([]);
    const userMenuOpen = ref(false);

    const appointmentStore = useAppointmentStore();
    const authStore = useAuthStore();
     
    const user = computed(() => authStore.user);

    const logout = () => {
      authStore.logout();
    };

    const changePassword = () => {
      // Implementiere die Logik zum Ändern des Passworts
    };
      

    const search = async () => {
      await appointmentStore.loadAppointments();

      searchResults.value = [];
      if (searchTextfield.value.length > 1) {
        const searchText = searchTextfield.value.toLowerCase();

        const singleAppointments: SingleAppointment[] = appointmentStore.getAllAppointments.filter(
          (appointment: SingleAppointment) => appointment.patient?.fullName.toLowerCase().includes(searchText)
        );  
        
        searchResults.value = [...singleAppointments];
        searchResults.value.sort((a, b) => {
          const dateA = a.startTime;
          const dateB = b.startTime;
          return dateA.getTime() - dateB.getTime();
        });
        
        showDialog.value = true; // Dialog öffnen
      }
    };

    const closeDialog = () => {
      searchResults.value = [];
      searchTextfield.value = '';
      showDialog.value = false; // Dialog schließen
    };

    const navigateTargetDate = (newDate: Date) => {
      EventBus.set('currentDayChanged1', newDate);
      closeDialog(); // Dialog schließen nach Auswahl
    };

    const getReadableDate = (date: Date) => {
      return Dateconversions.convertDateToReadableString(date);
    };

    return {
      userMenuOpen,
      user,
      logout,
      changePassword,
      searchTextfield,
      showDialog,
      searchResults,
      search,
      closeDialog,
      navigateTargetDate,
      getReadableDate,
    };
  },
});
</script>
