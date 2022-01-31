<template>
  <v-data-table
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
</template>

<script lang="ts">
import { Time } from '@/class/Enums';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Daylist extends Vue {
  private headers = [
    { text: '', value: 'time' },
    { text: 'Torben', value: 'torben' },
    { text: 'Andre', value: 'andre' },
    { text: 'Lisa', value: 'lisa' },
    { text: 'Tom', value: 'tom' },
    { text: 'Max', value: 'max' },
  ];

  private rows = [{}];

  mounted() : void {
    this.createRows();
  }

  createRows(): void {
    const times = Object.values(Time).filter((time): time is string => time.toString().includes(':'));

    // TODO: Fill therapists dynamically and fill appointments dynamically
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
