<template>
  <v-card>
    <v-card-title class="text-h5">Therapeuten verwalten</v-card-title>

    <v-card-text class="pt-5">
      <v-row
        class="pl-4 pr-2"
        v-for="therapist in therapists"
        :key="therapist.id"
      >
        <v-text-field
          :value="therapist.name"
          dense
          @change="renameTherapist(therapist.id, $event.target.value)"
        />
        <v-btn icon color="primary" @click="removeTherapist(therapist.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-row>
      <h6 class="text-subtitle-1 mt-8" style="color: black; font-weight: bold">
        Therapeuten hinzufügen
      </h6>
      <v-row class="pl-4 pr-2 mt-4">
        <v-text-field v-model="therapistTextfield" label="Name" dense />
        <v-btn icon color="secondary" @click="addTherapist">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
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
import { v4 as uuidv4 } from 'uuid';
import { Component, Vue } from 'vue-property-decorator';
import { mapActions, mapGetters } from 'vuex';
import TherapistStore from '@/store/therapistStore';
import { getModule } from 'vuex-module-decorators';
import { JSONTherapistDTO } from '@/class/JSONStructures';

@Component({
  computed: {
    ...mapGetters('therapists', ['getAllTherapists']),
  },
  methods: {
    ...mapActions('therapists', ['loadTherapists', 'addTherapist', 'updateTherapist', 'deleteTherapist']),
  },
})
export default class Settings extends Vue {
  therapistTextfield = '';

  // Direktes Abrufen des TherapistStores-Moduls
  private therapistStore = getModule(TherapistStore);

  get therapists() {
    return this.therapistStore.getAllTherapists;
  }

  mounted(): void {
    this.therapistStore.loadTherapists();
  }

  addTherapist(): void {
    this.therapistStore.addTherapist();
  }

  removeTherapist(id: number): void {
    this.therapistStore.deleteTherapist(id);
  }

  updateTherapist(id: number, newName: string): void {
    const updatedTherapist: JSONTherapistDTO = {
      id,
      name: newName,
      activeSince: 
      
    };
    this.therapistStore.updateTherapist({ id, therapist: updatedTherapist });
  }

  cancelChanges(): void {
    this.$emit('dialogClosed');
  }

  commitChanges(): void {
    this.$emit('dialogClosed');
  }
}
</script>
