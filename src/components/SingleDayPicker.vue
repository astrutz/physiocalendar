<template>
  <v-row align="center" justify="center">
    <v-col cols="auto">
      <v-btn @click="setPreviousDate">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="auto">
      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" v-bind="attrs" v-on="on">
            {{ weekday }} {{ dateFormatted }}
          </v-btn>
        </template>
        <v-date-picker
          v-model="date"
          :allowed-dates="dateIsAllowed"
          locale="de-de"
          :first-day-of-week="1"
        ></v-date-picker>
      </v-menu>
    </v-col>
    <v-col cols="auto">
      <v-btn @click="setNextDate">
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import Dateconversions from '@/class/Dateconversions';
import holidays from '@/data/holidays.json'; // Correctly import JSON file

export default defineComponent({
  props: {
    currentSingleDay: {
      type: Date,
      required: true,
    },
  },
  emits: ['currentDayChanged'],
  setup(props, { emit }) {
    const date = ref<string>(new Date().toISOString().substr(0, 10));
    const holidaysSet = new Set(holidays.days);

    const dateFormatted = computed(() =>
      Dateconversions.convertEnglishToGermanReadableString(date.value)
    );

    const weekday = computed(() => getWeekdaybyDate(new Date(date.value)));

    const menu = ref(false);

    const closeMenu = (): void => {
      menu.value = false;
    };

    const dateIsAllowed = (dateVal: any): boolean => {
  const dateToCheck = typeof dateVal === 'string' ? dateVal : dateVal.toISOString().substr(0, 10);
  if (holidaysSet.has(dateToCheck)) {
    return false;
  }
  const day = new Date(dateToCheck).getDay();
  return day > 0 && day < 6;
};


    const getCombinedDate = (dateString?: string): Date => {
      const dateStr = dateString || date.value;
      const timezoneOffsetInHours = new Date(`${dateStr}T00:00:00.000Z`).getTimezoneOffset() * -1;
      const offsetSuffix = `${timezoneOffsetInHours < 0 ? '-' : '+'}0${Math.abs(timezoneOffsetInHours / 60)}:00`;
      return new Date(`${dateStr}T00:00:00.000${offsetSuffix}`);
    };

    const getWeekdaybyDate = (date?: Date): string => {
      const dateToCheck = date || getCombinedDate();
      return Dateconversions.getWeekdayStringForDate(dateToCheck);
    };

    const setPreviousDate = (): void => {
      const newDate = getCombinedDate();
      newDate.setDate(newDate.getDate() - 1);
      while (!dateIsAllowed(newDate)) {
        newDate.setDate(newDate.getDate() - 1);
      }
      date.value = newDate.toISOString().substr(0, 10);
    };

    const setNextDate = (): void => {
      const newDate = getCombinedDate();
      newDate.setDate(newDate.getDate() + 1);
      while (!dateIsAllowed(newDate)) {
        newDate.setDate(newDate.getDate() + 1);
      }
      date.value = newDate.toISOString().substr(0, 10);
    };

    watch(date, () => {
      emit('currentDayChanged', dateFormatted.value);
    });

    return {
      date,
      dateFormatted,
      weekday,
      menu,
      dateIsAllowed,
      setPreviousDate,
      setNextDate,
    };
  },
});
</script>
