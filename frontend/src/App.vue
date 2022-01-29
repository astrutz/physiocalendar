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
import { namespace } from 'vuex-class';
import Backup from './class/Backup';
import AppBar from './components/AppBar.vue';
import ListTabs from './components/ListTabs.vue';

const storebackup = namespace('storebackup');

@Component({
  components: {
    AppBar,
    ListTabs,
  },
})

export default class App extends Vue {
  @storebackup.State
  public backup!: Backup

  @storebackup.Action
  public loadBackup!: () => Promise<void>
}

// export default Vue.extend({
//   name: 'App',
//   components: {
//     AppBar,
//     ListTabs,
//   },
//   data: () => ({
//     // TODO: Load Backup
//   }),
//   mounted() {
//     // TODO: Load Backup from frontend
//   }
// });
</script>
