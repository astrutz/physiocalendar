<template>
  <v-data-table
    v-if="localBackup !== null"
    :headers="headers"
    :items="rows"
    class="elevation-1 mt-4"
    disable-filtering
    disable-sort
    :items-per-page="-1"
    hide-default-footer
    dense
  >
    <template v-slot:item.time="{ item }">
      <span class="text-subtitle-2" style="color: black">{{ item.time }}</span>
    </template>
    <template v-for="header in headers" v-slot:[`header.${header.value}`]="{}">
      <span class="text-subtitle-2" style="color: black" :key="header.text">{{
        header.text
      }}</span>
    </template>
  </v-data-table>
  <div v-else>wird geladen</div>
</template>

<script lang="ts">
import Backup from '@/class/Backup';
import { Time } from '@/class/Enums';
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component
export default class Daylist extends Vue {
  @Prop() readonly currentSingleDay!: string;

  store = getModule(Store);

  private headers = [
    { text: '', value: 'time' },
  ];

  private rows = [{ time: '', tom: '' }];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('currentSingleDay')
  currentSingleDayChanged(): void {
    this.createHeaders();
    this.createRows();
  }

  @Watch('localBackup')
  localBackupChanged(): void {
    this.createHeaders();
    this.createRows();
  }

  mounted() : void {
    this.createHeaders();
    this.createRows();
  }

  createHeaders(): void {
    if (this.localBackup !== null) {
      const [day, month, year] = this.currentSingleDay.split('.');
      const currentSingleDate = new Date(`${year}-${month}-${day}`);
      const therapistHeaders = this.localBackup.therapists.filter(
        (therapist) => therapist.activeSince < currentSingleDate && therapist.activeUntil > currentSingleDate,
      ).map((therapist) => ({ text: therapist.name, value: therapist.name.toLowerCase() }));
      this.headers = [{ text: '', value: 'time' }].concat(therapistHeaders);
    }
  }

  createRows(): void {
    const times = Object.values(Time).filter((time): time is string => time.toString().includes(':'));
    // TODO: Fill fill appointments with therapists dynamically
    this.rows = times.map((time) => ({
      time: time.toString(),
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    }));
  }
}

</script>
