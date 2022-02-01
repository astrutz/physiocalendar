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
    <template v-slot:item.timeString="{ item }">
      <span class="text-subtitle-2" style="color: black">{{ item.time }}</span>
    </template>
    <template v-for="header in headers" v-slot:[`header.${header.value}`]="{}">
      <span class="text-subtitle-2" style="color: black" :key="header.text">{{
        header.text
      }}</span>
    </template>
    <!-- <template v-slot:item="{ item }">
      <tr>
        <td
          class="text-start"
          v-for="key in Object.keys(item).filter((key) => key !== 'time')"
          :key="`${key}-${item[key]}`"
        >
          {{ item[key] }}
        </td>
      </tr>
    </template> -->
  </v-data-table>
  <div v-else>wird geladen</div>
</template>

<script lang="ts">
import Backup from '@/class/Backup';
import Dateconversions from '@/class/Dateconversions';
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

  private rows: {
    [key: string]: string | Time
  }[] = [{ timeString: '' }];

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

  mounted(): void {
    this.createHeaders();
    this.createRows();
  }

  createHeaders(): void {
    if (this.localBackup !== null) {
      const currentSingleDate = Dateconversions.convertReadableStringToDate(this.currentSingleDay);
      const therapistHeaders = this.localBackup.therapists.filter(
        (therapist) => therapist.activeSince < currentSingleDate && therapist.activeUntil > currentSingleDate,
      ).map((therapist) => ({ text: therapist.name, value: therapist.name }));
      this.headers = [{ text: '', value: 'time' }].concat(therapistHeaders);
    }
  }

  createRows(): void {
    type TableRow = {
      [key: string]: string | Time
    }

    const times = Object.values(Time).filter((time): time is string => time.toString().includes(':'));
    const emptyRows = times.map((time) => ({
      timeString: time.toString(),
      time: time as unknown as Time,
    }));

    this.rows = emptyRows.map((row) => {
      const newRow: TableRow = {
        timeString: row.timeString,
        time: row.time,
      };
      this.headers.forEach((header) => {
        if (header.text !== '') {
          newRow[header.text] = this
            .localBackup?.daylist.searchAppointment(header.text, this.currentSingleDay, row.time as Time) || '';
        }
      });
      return newRow;
    });
  }
}

</script>
