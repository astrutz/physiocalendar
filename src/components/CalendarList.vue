<template>
  <v-container>
    <SingleDayPicker
      :currentSingleDay="currentSingleDay"
      @currentDayChanged="updateCurrentSingleDay"
      v-if="listType === 'daylist'"
    />
    <Daylist
      :currentSingleDay="currentSingleDay"
      v-if="listType === 'daylist'"
    />
    <AppBar
      @currentDayChanged="updateCurrentSingleDayFromAppBar"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import Dateconversions from '@/class/Dateconversions';
import SingleDayPicker from './SingleDayPicker.vue';
import Daylist from './Daylist.vue';
import AppBar from './AppBar.vue';

export default defineComponent({
  components: {
    SingleDayPicker,
    Daylist,
    AppBar,
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
