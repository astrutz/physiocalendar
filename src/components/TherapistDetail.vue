<template>
  <v-card v-if="therapist">
    <v-card-title class="text-h5">Therapeut verwalten</v-card-title>
    <v-card-text class="pt-5">
      <v-row class="pl-4 pr-2">
        <v-text-field label="Name" v-model="therapist.name" dense />
      </v-row>
      <v-row class="pl-4 pr-2 mt-2">
        <v-text-field label="Aktiv seit" v-model="therapist.activeSince" type="date" dense />
      </v-row>
      <v-row class="pl-4 pr-2 mt-2">
        <v-text-field label="Aktiv bis" v-model="therapist.activeUntil" type="date" dense />
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn color="error" @click="cancelChanges">Abbrechen</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" button @click="commitChanges">Speichern</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useTherapistStore } from '@/store/TherapistStore';
import Therapist from '@/class/Therapist';

export default defineComponent({
  props: {
    therapistId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup(props, { emit }) {
    const therapistStore = useTherapistStore();
    const therapist = ref<Therapist | null>(null);

    onMounted(() => {
      if (props.therapistId !== null) {
        const therapistData = therapistStore.getTherapistById(props.therapistId);
        if (therapistData) {
          therapist.value = { ...therapistData };
        }
      }
    });

    const commitChanges = () => {
      if (therapist.value) {
        if (props.therapistId) {
          therapistStore.updateTherapist(props.therapistId, therapist.value);
        } else {
          therapistStore.addTherapist(therapist.value);
        }
        emit('dialogClosed');
      }
    };

    const cancelChanges = () => {
      emit('dialogClosed');
    };

    return {
      therapist,
      commitChanges,
      cancelChanges,
    };
  },
});
</script>
