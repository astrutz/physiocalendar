<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col>
          Therapeuten verwalten
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text class="pt-5">
      <v-row align="center">
        <!-- Suchfeld -->
        <v-col>
          <v-text-field v-model="search" label="Suche" clearable @input="filterTherapists" />
        </v-col>
        <!-- Plus Button -->
        <v-col cols="auto">
          <v-btn class="createTherapistBtn" color="green" @click="openCreateTherapistDialog">
            <v-icon color="white">mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="filteredTherapists"
      item-key="id"
      :loading="loading"
      :loading-text="'Laden...'">

      <template v-slot:item="{ item }">
        <tr @click="showDetail(item)" style="cursor: pointer;">
          <td>{{ item.fullName }}</td>
          <td>{{ formatDate(item.activeSince) }}</td>
          <td>{{ formatDate(item.activeUntil) }}</td>
          <td>
            <v-icon v-if="item.isActive" color="green">mdi-check</v-icon>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Fehlermeldung, falls ein Fehler aufgetreten ist -->
    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <v-card-actions>
      <v-btn color="grey" @click="closeDialog">Abbrechen</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>

    <!-- Dialoge für die Therapeutenverwaltung -->
    <v-dialog v-model="createTherapistDialog" max-width="1500">
      <v-card>
        <CreateTherapist @save="createTherapist" @cancel="closeCreateTherapistDialog" />
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" persistent class="resizable-dialog">
      <v-card v-if="selectedTherapist">
        <TherapistDetail
          :therapistId="selectedTherapist.id"
          @save="saveTherapistChanges"
          @deleteTherapist="deleteTherapist"
          @cancel="closeDetailDialog"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import TherapistDetail from '@/components/TherapistDetail.vue';
import CreateTherapist from '@/components/CreateTherapist.vue';
import { useTherapistStore } from '@/store/TherapistStore';
import Therapist from '@/class/Therapist';

export default defineComponent({
  components: {
    TherapistDetail,
    CreateTherapist,
  },
  setup(props, { emit }) {
    const therapistStore = useTherapistStore();

    const headers = ref([
      { title: 'Name', value: 'name', sortable: true, filterable: true },
      { title: 'Aktiv seit', value: 'activeSince', sortable: true, filterable: true },
      { title: 'Aktiv bis', value: 'activeUntil', sortable: true, filterable: true },
      { title: 'Aktiv', value: 'isActive', sortable: true, filterable: true },
    ]);

    const detailDialog = ref(false);
    const createTherapistDialog = ref(false);
    const selectedTherapist = ref<Therapist | null>(null);
    const search = ref('');

    const loading = computed(() => therapistStore.loading);
    const error = computed(() => therapistStore.error);
    const therapists = computed(() => therapistStore.getAllTherapists);
    const filteredTherapists = ref([...therapists.value]);

    onMounted(() => {
      loadTherapists();
    });

    const loadTherapists = async () => {
      await therapistStore.loadTherapists();
      filteredTherapists.value = [...therapists.value];
    };

    const showDetail = (item: Therapist) => {
      selectedTherapist.value = item;
      detailDialog.value = true;
    };

    const saveTherapistChanges = async (event: { therapist: Therapist }) => {
      if (event.therapist) {
        await therapistStore.updateTherapist(event.therapist.id, event.therapist);
        await loadTherapists();
        closeDetailDialog();
      }
    };

    const deleteTherapist = async (event: { therapist: Therapist }) => {
      if (event.therapist) {
        await therapistStore.deleteTherapist(event.therapist.id);
        await loadTherapists();
        closeDetailDialog();
      }
    };

    const createTherapist = async (event: { therapist: Therapist }) => {
      if (event.therapist) {
        await therapistStore.addTherapist(event.therapist);
        await loadTherapists();
        closeCreateTherapistDialog();
      }
    };

    const closeDetailDialog = () => {
      detailDialog.value = false;
      selectedTherapist.value = null;
    };

    const closeCreateTherapistDialog = () => {
      createTherapistDialog.value = false;
    };

    const openCreateTherapistDialog = () => {
      createTherapistDialog.value = true;
    };

    const closeDialog = () => {
      emit('dialogClosed');
    };

    const filterTherapists = () => {
      const searchTerm = search.value.toLowerCase();
      filteredTherapists.value = therapists.value.filter(
        (therapist) =>
          therapist.fullName.toLowerCase().includes(searchTerm)
      );
    };

    const formatDate = (date: Date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    return {
      headers,
      detailDialog,
      createTherapistDialog,
      selectedTherapist,
      search,
      loading,
      error,
      closeDialog,
      filteredTherapists,
      loadTherapists,
      showDetail,
      saveTherapistChanges,
      deleteTherapist,
      createTherapist,
      closeDetailDialog,
      closeCreateTherapistDialog,
      openCreateTherapistDialog,
      filterTherapists,
      formatDate,
    };
  },
});
</script>

<style>
.resizable-dialog .v-card {
  resize: both;
  overflow: auto;
}

.v-btn {
  height: 100%;
}
</style>