<template>
  <v-card>
    <v-card-title class="text-h5"> Therapeuten verwalten </v-card-title>

    <v-card-text class="pt-5">
      <v-row
        class="pl-4 pr-2"
        v-for="therapist in therapists.filter(
          (therapist) =>
            therapist.state !== 'removed' && therapist.state !== 'added-removed'
        )"
        :key="therapist.id"
      >
        <v-text-field :value="therapist.name" dense readonly />
        <v-btn icon color="primary" @click="removeTherapist(therapist.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-row>
      <h6 class="text-subtitle-1 mt-8" style="color: black; font-weight: bold">
        Therapeuten hinzufügen
      </h6>
      <v-row class="pl-4 pr-2 mt-4">
        <v-text-field v-model="therapistTextfield" label="Name" dense />
        <v-btn icon color="secondary" @click="addTherapist()">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-btn
        color="error"
        text
        @click="
          reloadTherapists();
          $emit('dialogClosed');
        "
      >
        Abbrechen
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" button @click="commitNewTherapists()">
        Speichern
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { v4 as uuidv4 } from 'uuid';
import Backup from '@/class/Backup';
import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component
export default class Settings extends Vue {
  store = getModule(Store);

  backup: Backup | null = null;

  therapists: {
    name: string,
    id: string,
    state: 'unchanged' | 'removed' | 'added' | 'added-removed'
  }[] = [];

  therapistTextfield = '';

  mounted(): void {
    this.backup = this.store.getBackup;
    this.reloadTherapists();
  }

  reloadTherapists(): void {
    this.therapists = this.backup?.therapists.map((therapist) => ({
      name: therapist.name,
      id: therapist.id,
      state: 'unchanged',
    })) || [];
  }

  removeTherapist(id: string): void {
    const therapistFound = this.therapists.find((therapist) => therapist.id === id);
    if (therapistFound) {
      const i = this.therapists.indexOf(therapistFound);
      if (this.therapists[i].state === 'added') {
        this.therapists[i].state = 'added-removed';
      } else {
        this.therapists[i].state = 'removed';
      }
    }
  }

  addTherapist(): void {
    this.therapists.push({
      name: this.therapistTextfield,
      id: uuidv4(),
      state: 'added',
    });
    this.therapistTextfield = '';
  }

  commitNewTherapists(): void {
    this.therapists.forEach((therapist) => {
      if (therapist.state === 'added') {
        this.store.addTherapist({ name: therapist.name, id: therapist.id });
      } else if (therapist.state === 'removed') {
        this.store.removeTherapist(therapist.id);
      }
    });
    this.$emit('dialogClosed');
  }
}

</script>
