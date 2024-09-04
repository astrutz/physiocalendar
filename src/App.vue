<template>
  <v-app>
    <AppBar v-if="isAuthenticated" />
    <v-main>
      <Login v-if="true" />
      <ListTabs v-if="isAuthenticated" />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import AppBar from './components/AppBar.vue';
import ListTabs from './components/ListTabs.vue';
import { useAuthStore } from './store/authStore';
import Login from './components/Login.vue';

export default defineComponent({
  components: {
    AppBar,
    ListTabs,
    Login
  },
  setup() {
    const authStore = useAuthStore();
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    return { isAuthenticated };
  },
});
</script>
