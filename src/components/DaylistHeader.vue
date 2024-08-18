<template>
  <div class="daylist-header">
    <v-card class="mb-2" outlined>
      <v-card-title>
        <span>{{ therapist.name }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="openAbsenceDialog">
          <v-icon>mdi-calendar-remove</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-subtitle>Generelle Abwesenheiten (Wochentage)</v-card-subtitle>
      <v-list dense>
        <v-list-item v-for="absence in weekdayAbsences" :key="absence.id">
          <v-list-item-content>
            <v-list-item-title>{{ formatWeekday(absence.weekday) }}: {{ formatTimeRange(absence.startTime, absence.endTime) }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="editAbsence(absence)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="deleteAbsence(absence)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-card-subtitle>Ausnahmen (Spezifische Tage)</v-card-subtitle>
      <v-list dense>
        <v-list-item v-for="exception in specificDateAbsences" :key="exception.id">
          <v-list-item-content>
            <v-list-item-title>{{ formatDate(exception.date) }}: {{ formatTimeRange(exception.startTime, exception.endTime) }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="editAbsence(exception)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="deleteAbsence(exception)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Dialog für das Hinzufügen/Bearbeiten von Abwesenheiten -->
    <absence-dialog
      v-if="absenceDialogOpen"
      :absence="selectedAbsence"
      @save="saveAbsence"
      @close="closeAbsenceDialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import AbsenceDialog from './AbsenceDialog.vue';
import AbsenceStore from '@/store/AbsenceStore';
import Absence from '@/class/Absence';
import Therapist from '@/class/Therapist';
import { Weekday } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';
import { TimeUtils } from '@/class/TimeUtils';

@Component({
  components: {
    AbsenceDialog,
  },
})
export default class DaylistHeader extends Vue {
  @Prop({ required: true }) therapist!: Therapist;

  public absenceDialogOpen: boolean = false;
  public selectedAbsence: Absence | null = null;
  public absences: Absence[] = [];

  absenceStore = getModule(AbsenceStore);

  async mounted() {
    await this.loadAbsences();
  }

  private async loadAbsences() {
    await this.absenceStore.loadAbsences(this.therapist.id);
    this.absences = this.absenceStore.getAllAbsences;
  }

  get weekdayAbsences(): Absence[] {
    return this.absences.filter(absence => absence.weekday !== null && absence.date === null);
  }

  get specificDateAbsences(): Absence[] {
    return this.absences.filter(absence => absence.date !== null);
  }

  public formatWeekday(weekday: Weekday): string {
    switch (weekday) {
      case Weekday.MONDAY:
        return 'Montag';
      case Weekday.TUESDAY:
        return 'Dienstag';
      case Weekday.WEDNESDAY:
        return 'Mittwoch';
      case Weekday.THURSDAY:
        return 'Donnerstag';
      case Weekday.FRIDAY:
        return 'Freitag';
      default:
        return '';
    }
  }

  public formatDate(date: Date): string {
    return Dateconversions.convertDateToReadableString(date);
  }

  public formatTimeRange(startTime: Date, endTime: Date): string {
    return TimeUtils.formatTimeRange(startTime, endTime);
}

  public openAbsenceDialog(): void {
    this.selectedAbsence = new Absence(0, new Date(), Weekday.MONDAY, new Date(), new Date());
    this.absenceDialogOpen = true;
  }

  public closeAbsenceDialog(): void {
    this.absenceDialogOpen = false;
  }

  public async saveAbsence(absence: Absence): Promise<void> {
    if (absence.id) {
      await this.absenceStore.updateAbsence(this.therapist.id, absence);
    } else {
      await this.absenceStore.addAbsence(this.therapist.id, absence);
    }
    this.closeAbsenceDialog();
    await this.loadAbsences();
  }

  public async deleteAbsence(absence: Absence): Promise<void> {
    await this.absenceStore.deleteAbsence(this.therapist.id, absence.id);
    await this.loadAbsences();
  }

  public editAbsence(absence: Absence): void {
    this.selectedAbsence = absence; 
    this.absenceDialogOpen = true;
  }
}
</script>

<style scoped>
.daylist-header {
  padding: 16px;
}
</style>
