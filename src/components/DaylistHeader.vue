<template>
  <div
    class="therapist-header"
    @click="absenceDialog = true"
  >
    {{ therapist }}
    <v-dialog
      v-model="absenceDialog"
      width="600"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Abwesenheiten von {{ therapist }} am {{date}}
        </v-card-title>

        <v-card-text class="pt-5">
            <v-row
              v-for="(absence, index) in newAbsences"
              :key="`${absence.start}-${absence.end}-${index}`"
            >
            <v-col>
              <v-select
                :items="times"
                :value="absence.start"
                v-model="newAbsences[index].start"
                label="Von"
              ></v-select>
            </v-col>
            <v-col>
              <v-select
                :items="times"
                :value="absence.end"
                v-model="newAbsences[index].end"
                label="Bis"
              ></v-select>
            </v-col>
            <v-col cols="1">
              <v-btn
                icon
                color="primary"
                @click="newAbsences = newAbsences.filter((abs, i) => i !== index)"
                style="margin-top: 12px;"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
            </v-row>
          <v-btn
            icon
            color="primary"
            @click="newAbsences.push({start: null, end: null})"
          >
            <v-icon>mdi-clock-plus-outline</v-icon>
          </v-btn>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            color="error"
            text
            @click="resetInputs()"
          > Abbrechen </v-btn>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            button
            @click="
              submitAbsences();
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
import { Time } from '@/class/Enums';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DaylistHeader extends Vue {
  @Prop() readonly therapist!: string;

  @Prop() readonly date!: string;

  @Prop() readonly absences!: { start: Time, end: Time }[];

  times = ['7:00', '7:20', '7:40',
    '8:00', '8:20', '8:40',
    '9:00', '9:20', '9:40',
    '10:00', '10:20', '10:40',
    '11:00', '11:20', '11:40',
    '12:00', '12:20', '12:40',
    '13:00', '13:20', '13:40',
    '14:00', '14:20', '14:40',
    '15:00', '15:20', '15:40',
    '16:00', '16:20', '16:40',
    '17:00', '17:20', '17:40',
    '18:00', '18:20', '18:40',
    '19:00', '19:20', '19:40',
    '20:00', '20:20', '20:40',
  ]

  newAbsences = this.absences;

  absenceDialog = false;

  resetInputs(): void {
    this.newAbsences = this.absences;
    this.absenceDialog = false;
  }

  submitAbsences(): void {
    const absencesToBeSubmitted = this.newAbsences.filter((abs) => abs.start !== null && abs.end !== null);
    console.log(absencesToBeSubmitted);
    // TODO: Emit absences as event to daylist
    this.absenceDialog = false;
  }
}

</script>
