<template>
  <v-menu
    v-model="dropdownOpen"
    close-on-content-click
    offset-y
  >
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props">
        <v-icon>mdi-menu-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="openDialog(0)">
        <v-list-item-title>Konflikte prüfen</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openDialog(1)">
        <v-list-item-title>Terminfinder</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openDialog(2)">
        <v-list-item-title>Therapeuten verwalten</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openDialog(3)">
        <v-list-item-title>Patienten verwalten</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- Dialoge -->
  <v-dialog v-model="menuItems[0].dialog" max-width="1000">
    <ConflictDialog @dialogClosed="closeDialog(0)" />
  </v-dialog>
  <v-dialog v-model="menuItems[1].dialog" max-width="800">
    <Terminfinder @dialogClosed="closeDialog(1)" />
  </v-dialog>
  <v-dialog v-model="menuItems[2].dialog" max-width="800">
    <Therapists @dialogClosed="closeDialog(2)" />
  </v-dialog>
  <v-dialog v-model="menuItems[3].dialog" max-width="800">
    <Patients @dialogClosed="closeDialog(3)" />
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Terminfinder from '@/components/Terminfinder.vue';
import Therapists from '@/components/Therapists.vue';
import Patients from '@/components/Patients.vue';
import ConflictDialog from './ConflictDialog.vue';

export default defineComponent({
  components: {
    Terminfinder,
    Therapists,
    Patients,
    ConflictDialog,
  },
  setup() {
    const dropdownOpen = ref(false);
    const menuItems = ref([
      { title: 'Konflikte prüfen', dialog: false },
      { title: 'Terminfinder', dialog: false },
      { title: 'Therapeuten verwalten', dialog: false },
      { title: 'Patienten verwalten', dialog: false },
    ]);

    const downloadItem = () => {
      console.log('TODO: Implementiere das Herunterladen von strukturierten Daten im JSON-Format');
    };

    const openDialog = (index: number) => {
      dropdownOpen.value = false; // Menü schließen, wenn ein Dialog geöffnet wird
      menuItems.value[index].dialog = true;
    };

    const closeDialog = (index: number) => {
      menuItems.value[index].dialog = false;
    };

    return {
      dropdownOpen,
      menuItems,
      downloadItem,
      openDialog,
      closeDialog,
    };
  },
});
</script>
