<template>
  <v-row align="center" justify="center">
    <v-col cols="auto"
      ><v-btn text @click="previousWeekDay">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn
        color="secondary"
        v-model="dateFormatted"
        v-bind="attrs"
        v-on="on"
        >{{ weekDay }}</v-btn
      >
    </v-col>
    <v-col cols="auto">
      <v-btn text @click="setNextWeekDay">
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Weekday } from '@/class/Enums';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class WeekDayPicker extends Vue {
  private weekDay: Weekday = 'Montag';

  setNextWeekDay() : void {
    this.weekDay = 'Dienstag';
  }

  previousWeekDay() : void {
    this.weekDay = 'Freitag';
  }
}

</script>
