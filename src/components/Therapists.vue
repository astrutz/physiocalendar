<template>
  <v-card>
    <v-card-title>
      Therapeuten verwalten
      <v-spacer></v-spacer>
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pt-3">
      <v-row class="align-center mb-4">
        <v-btn color="secondary" @click="addTherapist" elevation="2">
          <v-icon left>mdi-plus</v-icon>
          Therapeuten hinzufügen
        </v-btn>
      </v-row>

      <v-divider></v-divider>

      <v-row class="pl-4 pr-2 mt-2" v-for="therapist in therapists" :key="therapist.id">
        <v-col cols="12" md="8" class="d-flex align-center">
          <v-btn icon color="primary" @click="editTherapist(therapist.id)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-text-field :value="therapist.name" dense readonly class="ml-2" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-end align-center">
          <v-btn icon color="error" @click="removeTherapist(therapist.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="closeDialog">Schließen</v-btn>
    </v-card-actions>

    <v-dialog v-model="showTherapistDetailDialog" max-width="600">
      <TherapistDetail
        v-if="showTherapistDetailDialog"
        :therapistId="selectedTherapistId ?? undefined"
        @dialogClosed="closeTherapistDetailDialog"
      />
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import TherapistDetail from './TherapistDetail.vue';
import { useTherapistStore } from '@/store/TherapistStore';

export default defineComponent({
  components: {
    TherapistDetail,
  },
  setup() {
    const therapistStore = useTherapistStore();
    const showTherapistDetailDialog = ref(false);
    const selectedTherapistId = ref<number | null>(null);

    const therapists = computed(() => therapistStore.getAllTherapists);

    const addTherapist = () => {
      selectedTherapistId.value = null;
      showTherapistDetailDialog.value = true;
    };

    const editTherapist = (id: number) => {
      selectedTherapistId.value = id;
      showTherapistDetailDialog.value = true;
    };

    const removeTherapist = (id: number) => {
      therapistStore.deleteTherapist(id);
    };

    const closeDialog = () => {
      showTherapistDetailDialog.value = false;
    };

    const closeTherapistDetailDialog = () => {
      showTherapistDetailDialog.value = false;
    };

    return {
      therapists,
      showTherapistDetailDialog,
      selectedTherapistId,
      addTherapist,
      editTherapist,
      removeTherapist,
      closeDialog,
      closeTherapistDetailDialog,
    };
  },
});
</script>

<style scoped>
.v-card-title {
  background-color: #2a2f79;
  color: white;
}

.v-card-actions {
  background-color: #f5f5f5;
}

.v-btn {
  text-transform: none;
}

.v-btn[icon] {
  min-width: 40px;
}

.v-text-field {
  width: 100%;
}
</style>
