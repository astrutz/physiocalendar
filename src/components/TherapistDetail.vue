<template>
    <v-card>
      <v-card-title class="text-h5">Therapeut verwalten</v-card-title>
  
      <v-card-text class="pt-5">
        <v-row class="pl-4 pr-2">
          <v-text-field
            label="Name"
            v-model="therapist.name"
            dense
          />
        </v-row>
        <v-row class="pl-4 pr-2 mt-2">
          <v-text-field
            label="Aktiv seit"
            v-model="therapist.activeSince"
            type="date"
            dense
          />
        </v-row>
        <v-row class="pl-4 pr-2 mt-2">
          <v-text-field
            label="Aktiv bis"
            v-model="therapist.activeUntil"
            type="date"
            dense
          />
        </v-row>
      </v-card-text>
  
      <v-card-actions>
        <v-btn color="error" text @click="cancelChanges">
          Abbrechen
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" button @click="commitChanges">
          Speichern
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
  
  <script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import Therapist from '@/class/Therapist';
  import { getModule } from 'vuex-module-decorators';
import TherapistStore from '@/store/TherapistStore';
  
  @Component
  export default class TherapistDetail extends Vue {
    @Prop() private therapistId!: number | null;
  
    private therapistStore = getModule(TherapistStore);
    public therapist!: Therapist;
  
    mounted(): void {
      if (this.therapistId !== null) {
        const therapist = this.therapistStore.getTherapistById(this.therapistId);
        if (therapist) {
          this.therapist = { ...therapist };
        }
      }
    }
  
    commitChanges(): void {
      if (this.therapistId) {
        this.therapistStore.updateTherapist(this.therapistId, this.therapist);
      } else {
        this.therapistStore.addTherapist(this.therapist);
      }
      this.$emit('dialogClosed');
    }
  
    cancelChanges(): void {
      this.$emit('dialogClosed');
    }
  }
  </script>
  