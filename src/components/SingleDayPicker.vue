<template>
  <v-row align="center" justify="center">
    <v-col cols="auto">
      <v-btn @click="setPreviousDate">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn color="primary" @click="openDatePicker">
        {{ weekday }} {{ dateFormatted }}
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn @click="setNextDate">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-col>
    <v-dialog v-model="datePickerOpen" max-width="290">
      <v-date-picker
        v-model="dateObject"
        :header="formatHeader(dateObject)"
        :allowed-dates="dateIsAllowed"
        locale="de-de"
        :first-day-of-week="1"
        @input="updateDate"
      ></v-date-picker>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import Dateconversions from '@/class/Dateconversions';
import holidays from '@/data/holidays.json';

export default defineComponent({
  props: {
    currentSingleDay: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  emits: ['currentDayChanged'],
  setup(props, { emit }) {
    const dateObject = ref<Date>(props.currentSingleDay); // Ref to hold Date object
    const holidaysSet = new Set(holidays.days);
    const datePickerOpen = ref(false);
    const weekday = ref<string>('');

    onMounted(() => {
      updateWeekday();
    });

    const dateFormatted = computed(() =>
      Dateconversions.convertEnglishToGermanReadableString(dateObject.value.toISOString().substr(0, 10))
    );

    const updateWeekday = () => {
      weekday.value = getWeekdaybyDate(dateObject.value);
    };

    const openDatePicker = () => {
      datePickerOpen.value = true;
    };

    const updateDate = () => {
      datePickerOpen.value = false;
      emit('currentDayChanged', dateObject.value);
    };

    const formatHeader = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return date.toLocaleDateString('de-DE', options);
    };

    const dateIsAllowed = (dateVal: any): boolean => {
      const dateToCheck = typeof dateVal === 'string' ? dateVal : dateVal.toISOString().substr(0, 10);
      if (holidaysSet.has(dateToCheck)) {
        return false;
      }
      const day = new Date(dateToCheck).getDay();
      return day != 0;
    };

    const getWeekdaybyDate = (date?: Date): string => {
      const dateToCheck = date || dateObject.value;
      return Dateconversions.getWeekdayStringForDate(dateToCheck);
    };

    const setPreviousDate = (): void => {
      const newDate = new Date(dateObject.value);
      newDate.setDate(newDate.getDate() - 1);
      while (!dateIsAllowed(newDate)) {
        newDate.setDate(newDate.getDate() - 1);
      }
      dateObject.value = newDate;
      updateWeekday();
      emit('currentDayChanged', newDate);
    };

    const setNextDate = (): void => {
      const newDate = new Date(dateObject.value);
      newDate.setDate(newDate.getDate() + 1);
      while (!dateIsAllowed(newDate)) {
        newDate.setDate(newDate.getDate() + 1);
      }
      dateObject.value = newDate;
      updateWeekday();
      emit('currentDayChanged', newDate);
    };

    watch(dateObject, () => {
      updateWeekday();
      emit('currentDayChanged', dateObject.value);
    });

    return {
      dateObject,
      dateFormatted,
      dateIsAllowed,
      formatHeader,
      weekday,
      datePickerOpen,
      setPreviousDate,
      setNextDate,
      updateDate,
      openDatePicker,
    };
  },
});
</script>