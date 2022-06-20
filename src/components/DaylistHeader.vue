<template>
  <div class="therapist-header" @click="absenceDialog = true">
    {{ therapist }}
    <v-dialog v-model="absenceDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Abwesenheiten von {{ therapist }}
        </v-card-title>

        <v-card-text class="pt-5"> aaaaaaaaa </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="error" text @click="resetInputs()"> Abbrechen </v-btn>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            button
            @click="
              addAbsences();
              createDialog = false;
            "
          >
            Speichern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DaylistHeader extends Vue {
  @Prop() readonly therapist!: string;

  absenceDialog = false;

  resetInputs(): void {
    this.absenceDialog = false;
  }

  addAbsences(): void {
    // TODO: Emit absences as event to daylist
    this.absenceDialog = false;
  }
}

</script>
