<template>
  <v-container>
    <SingleDayPicker
      :currentSingleDay="currentSingleDay"
      @currentDayChanged="currentSingleDay = $event"
      v-if="listType === 'daylist'"
    />
    <Daylist
      :currentSingleDay="currentSingleDay"
      v-if="listType === 'daylist'"
    />
    <AppBar
      @currentDayChanged1="console.log($event)"
      v-show="false"
    />
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Weekday } from '@/class/Enums';
import Dateconversions from '@/class/Dateconversions';
import EventBus from '@/class/EventBus';
import SingleDayPicker from './SingleDayPicker.vue';
import Daylist from './Daylist.vue';
import AppBar from './AppBar.vue';

@Component({
  components: {
    SingleDayPicker,
    Daylist,
    AppBar,
    EventBus,
  },
})

export default class CalendarList extends Vue {
  @Prop() readonly listType!: string;

  // eslint-disable-class-methods-use-this
  mounted(): void {
    EventBus.$on('currentDayChanged1', (dateFormatted: string) => {
      this.currentSingleDay = dateFormatted;
      // console.log(this.currentSingleDay);
    });
  }

  private dateFormatted: string = Dateconversions.convertEnglishToGermanReadableString(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
  );

  public currentSingleDay =
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
