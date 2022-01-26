<template>
  <v-container>
    <WeekDayPicker v-if="listType === 'masterlist'" />
    <SingleDayPicker v-if="listType === 'daylist'" />
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import WeekDayPicker from '@/components/WeekDayPicker.vue';
import SingleDayPicker from '@/components/SingleDayPicker.vue';

@Component({
  components: {
    WeekDayPicker,
    SingleDayPicker,
  },
})

export default class CalendarList extends Vue {
  @Prop() readonly listType!: string;
}
</script>
