<template>
    <v-card>
      <v-card-title class="text-h5">Alle Therapeuten</v-card-title>
  
      <v-card-text class="pt-5">
        <v-row
          class="pl-4 pr-2"
          v-for="therapist in therapists"
          :key="therapist.id"
        >
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
          :therapistId="selectedTherapistId"
          @dialogClosed="showTherapistDetailDialog = false"
        />
      </v-dialog>
    </v-card>
  </template>
  
  <script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import TherapistDetail from './TherapistDetail.vue';
  import { getModule } from 'vuex-module-decorators';
  import TherapistStore from '@/store/TherapistStore';

  
  @Component({
    components: {
      TherapistDetail,
    },
  })
  export default class Therapists extends Vue {
    public therapistStore = getModule(TherapistStore);
    public showTherapistDetailDialog = false;
    public selectedTherapistId: number | null = null;
  
    get therapists() {
      return this.therapistStore.getAllTherapists;
    }
  
    addTherapist(): void {
      this.selectedTherapistId = null;
      this.showTherapistDetailDialog = true;
    }
  
    editTherapist(id: number): void {
      this.selectedTherapistId = id;
      this.showTherapistDetailDialog = true;
    }
  
    removeTherapist(id: number): void {
      this.therapistStore.deleteTherapist(id);
    }
  }
  </script>
  