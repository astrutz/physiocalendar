<template>
  <v-data-table
    :headers="headers"
    :items="desserts"
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
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Daylist extends Vue {
  private headers = [
    {
      text: '',
      value: 'time',
    },
    { text: 'Torben', value: 'torben' },
    { text: 'Andre', value: 'andre' },
    { text: 'Lisa', value: 'lisa' },
    { text: 'Tom', value: 'tom' },
    { text: 'Max', value: 'max' },
  ];

  private desserts = [
    {
      time: '07:00',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '07:20',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '07:40',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '08:00',
      torben: '',
      andre: '',
      lisa: '',
      tom: 'Fr. Test',
      max: '',
    },
    {
      time: '08:20',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '08:40',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '09:20',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '09:40',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '10:00',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '10:20',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
    {
      time: '10:40',
      torben: '',
      andre: '',
      lisa: '',
      tom: '',
      max: '',
    },
  ]
}

</script>
