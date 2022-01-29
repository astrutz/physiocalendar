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
import WeekDayPicker from '@/components/WeekDayPicker.vue';
import Masterlist from '@/components/Masterlist.vue';
import SingleDayPicker from '@/components/SingleDayPicker.vue';
import Daylist from '@/components/Daylist.vue';

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
