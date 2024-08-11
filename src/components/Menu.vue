<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" text>
        <v-icon>mdi-menu-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="downloadItem()" class="menu-item">
        Backup runterladen
      </v-list-item>
      <v-list-item
        v-for="(item, index) in menuItems"
        :key="index"
        @click.stop="item.dialog = true"
        class="menu-item"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-dialog v-model="menuItems[0].dialog" max-width="600">
      <Import @dialogClosed="menuItems[0].dialog = false" />
    </v-dialog>
    <v-bottom-sheet v-model="menuItems[1].dialog">
      <Terminfinder @dialogClosed="menuItems[1].dialog = false" />
    </v-bottom-sheet>
    <v-dialog v-model="menuItems[2].dialog" max-width="800">
      <Therapists @dialogClosed="menuItems[2].dialog = false" />
    </v-dialog>
    <v-dialog v-model="menuItems[3].dialog" max-width="800">
      <Patients @dialogClosed="menuItems[3].dialog = false" />
    </v-dialog>
  </v-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Terminfinder from '@/components/Terminfinder.vue';
import Import from '@/components/Import.vue';
import Therapists from '@/components/Therapists.vue';
import Patients from '@/components/Patients.vue';

@Component({
  components: {
    Terminfinder,
    Import,
    Therapists,
    Patients,
  },
})

export default class Menu extends Vue {
  public menuItems = [
    { title: 'Backup einspielen', dialog: false },
    { title: 'Terminfinder', dialog: false },
    { title: 'Therapeuten verwalten', dialog: false },
    { title: 'Patienten verwalten', dialog: false },
  ];

  downloadItem(): void {
    console.log('TODO implement download structured Data in JSON Format')
  }
}
</script>

<style scoped>
.menu-item {
  cursor: pointer;
}
.menu-item:hover {
  background-color: #eeeeee;
}
</style>
