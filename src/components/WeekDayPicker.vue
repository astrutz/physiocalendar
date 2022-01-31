<template>
  <v-row align="center" justify="center">
    <v-col cols="auto"
      ><v-btn text @click="setPreviousWeekDay">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn
        color="primary"
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
import { Component, Vue } from 'vue-property-decorator';
import { Weekday } from '../class/Enums';

@Component
export default class WeekDayPicker extends Vue {
  private weekDay: Weekday = Weekday.MONDAY;

  setNextWeekDay() : void {
    Object.values(Weekday).forEach((weekday) => {
      console.log(weekday);
    });
    this.weekDay = Weekday.TUESDAY;
    this.$emit('weekDayChanged', this.weekDay);
  }

  setPreviousWeekDay() : void {
    this.weekDay = Weekday.FRIDAY;
    this.$emit('weekDayChanged', this.weekDay);
  }
}

</script>
