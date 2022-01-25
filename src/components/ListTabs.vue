<template>
  <div>
    <v-tabs class="mt-4" v-model="tab" background-color="transparent" grow>
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
import Vue from 'vue';
import CalendarList from './CalendarList.vue';

export default Vue.extend({
  name: 'ListTabs',
  components: { CalendarList },
  data: () => ({
    tab: null,
    lists: [{ name: 'Terminliste', type: 'Masterlist' }, { name: 'Stammliste', type: 'Daylist' }],
  }),
});

</script>
