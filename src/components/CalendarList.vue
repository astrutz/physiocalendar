<template>
  <v-container>
    <SingleDayPicker
    :currentSingleDay="currentSingleDay"
     @currentDayChanged="updateCurrentSingleDay"
    />
    <Daylist
      :currentSingleDay="currentSingleDay"
      v-if="listType === 'daylist'"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import Dateconversions from '@/class/Dateconversions';
import Daylist from './Daylist.vue';
import AppBar from './AppBar.vue';
import EventBus from '@/class/EventBus';
import SingleDayPicker from './SingleDayPicker.vue';

export default defineComponent({
  components: {
    Daylist,
    AppBar,
    SingleDayPicker
  },
  props: {
    listType: {
      type: String,
      required: true,
    },
  },
  setup() {
    const currentSingleDay = ref<Date>(
      new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    );

    const updateCurrentSingleDay = (newDate: Date) => {
      currentSingleDay.value = newDate;
    };

    const updateCurrentSingleDayFromAppBar = (dateFormatted: string) => {
      currentSingleDay.value = Dateconversions.convertReadableStringToDate(dateFormatted);
    };

    watch(() => EventBus.get('currentDayChanged1'), (newDate: Date | string) => {
      if (typeof newDate === 'string') {
        updateCurrentSingleDay(new Date(newDate));
      } else {
        updateCurrentSingleDay(newDate);
      }
    });

    return {
      currentSingleDay,
      updateCurrentSingleDay,
      updateCurrentSingleDayFromAppBar,
    };
  },
});
</script>

<style>
.container {
  max-width: 97%;
}

</style>
