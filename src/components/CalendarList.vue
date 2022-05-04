<template>
  <v-container>
    <WeekDayPicker
      @weekDayChanged="currentWeekDay = $event"
      v-if="listType === 'masterlist'"
    />
    <Masterlist
      :currentWeekDay="currentWeekDay"
      v-if="listType === 'masterlist'"
    />
    <SingleDayPicker
      @currentDayChanged="currentSingleDay = $event"
      v-if="listType === 'daylist'"
    />
    <Daylist
      :currentSingleDay="currentSingleDay"
      v-if="listType === 'daylist'"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Weekday } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';
import WeekDayPicker from './WeekDayPicker.vue';
import Masterlist from './Masterlist.vue';
import SingleDayPicker from './SingleDayPicker.vue';
import Daylist from './Daylist.vue';

@Component({
  components: {
    WeekDayPicker,
    SingleDayPicker,
    Masterlist,
    Daylist,
  },
})

export default class CalendarList extends Vue {
  @Prop() readonly listType!: string;

  currentSingleDay =
    Dateconversions.convertEnglishToGermanReadableString(
      (new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10)),
    );

  currentWeekDay = Weekday.MONDAY;
}
</script>

<style>
.container {
  max-width: 97%;
}
</style>
