<template>
  <div class="therapist-header" @click="absenceDialog = true">
    {{ therapist }}
    <v-dialog v-model="absenceDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ absenceType }} von {{ therapist }} am {{ date }}
        </v-card-title>

        <v-card-text class="pt-5">
          <v-row v-if="masterlistAbsences.length > 0">
            <v-col>
              <v-alert type="info">
                Für diesen Therapeuten sind Abwesenheiten in der Stammliste
                vorhanden:
                <p v-for="absence in masterlistAbsences" :key="absence.start" style="margin-bottom: 0px">
                  {{absence.day}} - {{ absence.start }} bis {{ absence.end }}
                </p>
              </v-alert>
            </v-col>
          </v-row>
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
                @click="
                  newAbsences = newAbsences.filter((abs, i) => i !== index)
                "
                style="margin-top: 12px"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn
            icon
            color="primary"
            @click="newAbsences.push({ start: null, end: null })"
          >
            <v-icon>mdi-clock-plus-outline</v-icon>
          </v-btn>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="error" text @click="resetInputs()"> Abbrechen </v-btn>
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
import Dateconversions from '@/class/Dateconversions';
import { Time } from '@/class/Enums';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class DaylistHeader extends Vue {
  @Prop() readonly therapist!: string;

  @Prop() readonly therapistID!: string;

  @Prop() readonly date!: string;

  @Prop() readonly absences!: { start: Time, end: Time }[];

  @Prop() readonly masterlistAbsences!: { start: Time, end: Time }[];

  private absenceType = Dateconversions.convertReadableStringToDate(this.date).getDay() === 6 ? 'Anwesenheiten' : 'Abwesenheiten';

  times = Dateconversions.getAllTimes();

  newAbsences = JSON.parse(JSON.stringify(this.absences)) as { start: Time, end: Time }[];

  absenceDialog = false;

  resetInputs(): void {
    this.newAbsences = JSON.parse(JSON.stringify(this.absences)) as { start: Time, end: Time }[];
    this.absenceDialog = false;
  }

  submitAbsences(): void {
    const absencesToBeSubmitted = this.newAbsences.filter((abs) => abs.start !== null && abs.end !== null);
    this.$emit('absencesChanged', {
      absences: absencesToBeSubmitted, therapistID: this.therapistID.slice(),
    });
    this.resetInputs();
  }
}

</script>
