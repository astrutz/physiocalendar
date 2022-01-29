<template>
  <v-row align="center" justify="center">
    <v-col cols="auto"
      ><v-btn text @click="setPreviousDate">
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
          <v-btn color="primary" v-model="dateFormatted" v-bind="attrs" v-on="on">{{
            dateFormatted
          }}</v-btn>
        </template>
        <v-date-picker
          v-model="date"
          @input="
            menu = false;
            getCombinedDate();
          "
          locale="de-de"
        ></v-date-picker>
      </v-menu>
    </v-col>
    <v-col cols="auto">
      <v-btn text @click="setNextDate">
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';

@Component
export default class SingleDayPicker extends Vue {
  private date: string = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10)

  private dateFormatted: string = SingleDayPicker.formatDateString(this.date)

  private menu = false;

  @Watch('date')
  dateChanged(): void {
    this.dateFormatted = SingleDayPicker.formatDateString(this.date);
  }

  static formatDateString(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  }

  getCombinedDate(): Date {
    const timezoneOffsetInHours = new Date(`${this.date}T00:00:00.000Z`).getTimezoneOffset() * -1;
    const offsetSuffix = `${timezoneOffsetInHours < 0 ? '-' : '+'}0${Math.abs(timezoneOffsetInHours / 60)}:00`;
    return new Date(`${this.date}T00:00:00.000${offsetSuffix}`);
  }

  setPreviousDate(): void {
    const date = this.getCombinedDate();
    date.setDate(date.getDate() - 1);
    this.date = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  setNextDate(): void {
    const date = this.getCombinedDate();
    date.setDate(date.getDate() + 1);
    this.date = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
}

</script>
