<template>
  <v-app>
    <AppBar />
    <v-main>
      <ListTabs />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppBar from './components/AppBar.vue';
import ListTabs from './components/ListTabs.vue';

export default defineComponent({
  components: {
    AppBar,
    ListTabs,
  },
});
</script>
