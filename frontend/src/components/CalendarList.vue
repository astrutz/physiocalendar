<template>
  <v-container>
    <WeekDayPicker v-if="listType === 'masterlist'" />
    <Masterlist v-if="listType === 'masterlist'" />
    <SingleDayPicker v-if="listType === 'daylist'" />
    <Daylist v-if="listType === 'daylist'" />
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
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
}
</script>
