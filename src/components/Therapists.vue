<template>
  <v-card>
    <v-card-title class="text-h5">Alle Therapeuten</v-card-title>
    <v-card-text class="pt-5">
      <v-row class="pl-4 pr-2" v-for="therapist in therapists" :key="therapist.id">
        <v-btn icon color="primary" @click="editTherapist(therapist.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-text-field :value="therapist.name" dense readonly />
        <v-btn icon color="primary" @click="removeTherapist(therapist.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-row>
      <v-row class="pl-4 pr-2 mt-4">
        <v-btn color="secondary" @click="addTherapist">
          <v-icon>mdi-plus"></v-icon>
          Therapeuten hinzufügen
        </v-btn>
      </v-row>
    </v-card-text>
    <v-dialog v-model="showTherapistDetailDialog" max-width="600">
      <TherapistDetail
        v-if="showTherapistDetailDialog"
        :therapistId="selectedTherapistId ?? undefined"
        @dialogClosed="showTherapistDetailDialog = false"
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

    return {
      therapists,
      showTherapistDetailDialog,
      selectedTherapistId,
      addTherapist,
      editTherapist,
      removeTherapist,
    };
  },
});
</script>
