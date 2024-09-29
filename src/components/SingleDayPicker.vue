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
    <v-col cols="auto">
      <v-btn color="primary" @click="setToday">Heute</v-btn>
    </v-col>

    <v-dialog v-model="datePickerOpen" max-width="290">
      <v-date-picker
        v-model="dateObject"
        :header="formatHeader(dateObject)"
        :allowed-dates="dateIsAllowed"
        :locale=locale
        :first-day-of-week="1"
        @input="updateDate"
      ></v-date-picker>
    </v-dialog>
  </v-row>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { getWeekdayStringForDate, convertEnglishToGermanReadableString } from '@/class/Dateconversions';
import holidays from '@/data/holidays.json';
import {  de } from 'vuetify/locale'

export default defineComponent({
  props: {
    currentSingleDay: {
      type: Date,
      required: true,
    },
  },
  emits: ['currentDayChanged'],
  setup(props, { emit }) {
    const holidaysSet = new Set(holidays.days);
    const datePickerOpen = ref(false);
    const weekday = ref<string>('');
    const initialDate = sessionStorage.getItem('currentDay');
    const dateObject = ref<Date>(initialDate ? new Date(initialDate) : new Date()); // Lade das Datum aus sessionStorage oder setze auf Gegenwart
    const locale = de;

    onMounted(() => {
      if (!initialDate) {
        sessionStorage.setItem('currentDay', dateObject.value.toISOString());
        updateWeekday();
      }
      updateWeekday();
      emit('currentDayChanged', dateObject.value);
    });

    watch(() => props.currentSingleDay, (newDate: Date) => {
      // Aktualisiere nur, wenn das neue Datum anders ist als das aktuelle dateObject
      if (newDate.toISOString() !== dateObject.value.toISOString()) {
          dateObject.value = new Date(newDate);
          updateWeekday();
        }
      });


    const dateFormatted = computed(() =>
      convertEnglishToGermanReadableString(dateObject.value.toISOString().substr(0, 10))
    );

    const updateWeekday = () => {
      weekday.value = getWeekdaybyDate(dateObject.value);
    };

    const openDatePicker = () => {
      datePickerOpen.value = true;
    };

    const updateDate = () => {
      datePickerOpen.value = false;
      updateWeekday();
      sessionStorage.setItem('currentDay', dateObject.value.toISOString());
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
      return day !== 0; // Sonntag ist nicht erlaubt
    };

    const getWeekdaybyDate = (date?: Date): string => {
      const dateToCheck = date || dateObject.value;
      return getWeekdayStringForDate(dateToCheck);
    };

    const setPreviousDate = (): void => {
      const newDate = new Date(dateObject.value);
      newDate.setDate(newDate.getDate() - 1);
      while (!dateIsAllowed(newDate)) {
        newDate.setDate(newDate.getDate() - 1);
      }
      dateObject.value = newDate;
      updateWeekday();
      sessionStorage.setItem('currentDay', newDate.toISOString());
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
      sessionStorage.setItem('currentDay', newDate.toISOString());
      emit('currentDayChanged', newDate);
    };

    const setToday = (): void => {
      const today = new Date();
      dateObject.value = today;
      updateWeekday();
      sessionStorage.setItem('currentDay', today.toISOString());
      emit('currentDayChanged', today);
    };

    const setDateExternally = (newDate: Date): void => {
      dateObject.value = new Date(newDate);
      updateWeekday();
      sessionStorage.setItem('currentDay', newDate.toISOString());
      emit('currentDayChanged', newDate);
    };

    watch(dateObject, () => {
      updateWeekday();
      sessionStorage.setItem('currentDay', dateObject.value.toISOString());
      emit('currentDayChanged', dateObject.value);
    });

    return {
      dateObject,
      dateFormatted,
      dateIsAllowed,
      formatHeader,
      weekday,
      datePickerOpen,
      locale,
      setPreviousDate,
      setNextDate,
      setToday,
      updateDate,
      openDatePicker,
    };
  },
});
</script>
