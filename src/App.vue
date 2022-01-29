<template>
  <v-app>
    <AppBar />
    <v-main>
      <ListTabs />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from './store/backup';
import Backup from './class/Backup';
import AppBar from './components/AppBar.vue';
import ListTabs from './components/ListTabs.vue';

@Component({
  components: {
    AppBar,
    ListTabs,
  },
})

export default class App extends Vue {
  store = getModule(Store);

  mounted() : void {
    this.store.loadBackup().then(() => {
      // TODO: Handle new data from getter
    });
  }
}
</script>
