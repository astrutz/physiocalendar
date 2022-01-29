<template>
  <v-app>
    <AppBar />
    <v-main>
      <ListTabs />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import AppBar from '@/components/AppBar.vue';
import ListTabs from '@/components/ListTabs.vue';

export default Vue.extend({
  name: 'App',
  components: {
    AppBar,
    ListTabs,
  },
  data: () => ({
    // TODO: Load Backup
  }),
});
</script>
