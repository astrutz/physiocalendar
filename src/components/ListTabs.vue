<template>
  <div>
    <v-tabs class="mt-4" v-model="tab" background-color="transparent" grow>
      <v-tabs-slider></v-tabs-slider>
      <v-tab v-for="list in lists" :key="list.name">
        {{ list.name }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item v-for="list in lists" :key="list.name">
        <CalendarList :listType="list.type" />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import CalendarList from './CalendarList.vue';

export default defineComponent({
  components: {
    CalendarList,
  },
  setup() {
    const tab = ref(null);
    const lists = ref([{ name: 'Terminliste', type: 'daylist' }]);

    return {
      tab,
      lists,
    };
  },
});
</script>
