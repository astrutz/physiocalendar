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
    <template v-for="header in headers" v-slot:[`header.${header.value}`]="{}">
      <span class="text-subtitle-2" style="color: black" :key="header.text">{{
        header.text
      }}</span>
    </template>
    <template v-slot:item="{ item }">
      <tr>
        <td
          style="overflow: hidden; white-space: nowrap; width: 0%"
          class="text-center"
          v-for="key in Object.keys(item).filter((key) => key !== 'time')"
          :key="`${key}-${item[key]}`"
        >
          <MasterlistElement
            v-if="!item[key].includes(':')"
            @appointmentAdded="addAppointment($event)"
            @appointmentChanged="changeAppointment($event)"
            @appointmentDeleted="deleteAppointment($event)"
            :patient="item[key]"
            :therapist="key"
            :time="Object.values(item)[0]"
            :day="currentWeekDay"
          />
          <span v-else>{{ item[key] }}</span>
        </td>
      </tr>
    </template>
  </v-data-table>
  <div v-else>wird geladen</div>
</template>

<script lang="ts">
import Backup from '@/class/Backup';
import { Time, Weekday } from '@/class/Enums';
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';
import MasterlistElement from './MasterlistElement.vue';

@Component({
  components: {
    MasterlistElement,
  },
})

export default class Masterlist extends Vue {
  @Prop() readonly currentWeekDay!: Weekday;

  store = getModule(Store);

  private headers = [
    { text: '', value: 'time', align: 'center' },
  ];

  private rows: {
    [key: string]: string | Time
  }[] = [{ timeString: '' }];

  get localBackup(): Backup | null {
    return this.store.getBackup;
  }

  @Watch('currentWeekDay')
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
      const today = new Date();
      const therapistHeaders = this.localBackup.therapists.filter(
        (therapist) => therapist.activeSince < today && therapist.activeUntil > today,
      ).map((therapist) => ({ text: therapist.name, value: therapist.name, align: 'center' }));
      this.headers = [{ text: '', value: 'time', align: 'center' }].concat(therapistHeaders);
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
            .localBackup?.masterlist.searchAppointment(header.text, this.currentWeekDay, row.time as Time) || '';
        }
      });
      return newRow;
    });
  }
}

</script>
