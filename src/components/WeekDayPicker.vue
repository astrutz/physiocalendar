<template>
  <v-row align="center" justify="center">
    <v-col cols="auto">
      <v-btn @click="setPreviousWeekDay">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn color="primary">{{ weekDay }}</v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn @click="setNextWeekDay">
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Weekday } from '@/class/Enums';

export default defineComponent({
  props: {
    initialWeekDay: {
      type: Number as unknown as () => Weekday,
      default: Weekday.MONDAY,
    },
  },
  emits: ['weekDayChanged'],
  setup(props, { emit }) {
    const weekDay = ref<Weekday>(props.initialWeekDay);

    const setNextWeekDay = () => {
      weekDay.value = ((weekDay.value as unknown as number) + 1) % 5 as unknown as Weekday;
      emit('weekDayChanged', weekDay.value);
    };

    const setPreviousWeekDay = () => {
      weekDay.value = ((weekDay.value as unknown as number) + 4) % 5 as unknown as Weekday;
      emit('weekDayChanged', weekDay.value);
    };

    return {
      weekDay,
      setNextWeekDay,
      setPreviousWeekDay,
    };
  },
});
</script>
