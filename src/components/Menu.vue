<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" text>
        <v-icon>mdi-menu-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="downloadItem" class="menu-item">
        Backup runterladen
      </v-list-item>
      <v-list-item
        v-for="(item, index) in menuItems"
        :key="index"
        @click.stop="openDialog(index)"
        class="menu-item"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-bottom-sheet v-model="menuItems[1].dialog">
      <Terminfinder @dialogClosed="closeDialog(1)" />
    </v-bottom-sheet>
    <v-dialog v-model="menuItems[2].dialog" max-width="800">
      <Therapists @dialogClosed="closeDialog(2)" />
    </v-dialog>
    <v-dialog v-model="menuItems[3].dialog" max-width="800">
      <Patients @dialogClosed="closeDialog(3)" />
    </v-dialog>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Terminfinder from '@/components/Terminfinder.vue';
import Therapists from '@/components/Therapists.vue';
import Patients from '@/components/Patients.vue';

export default defineComponent({
  components: {
    Terminfinder,
    Therapists,
    Patients,
  },
  setup() {
    const menuItems = ref([
      { title: 'Backup einspielen', dialog: false },
      { title: 'Terminfinder', dialog: false },
      { title: 'Therapeuten verwalten', dialog: false },
      { title: 'Patienten verwalten', dialog: false },
    ]);

    const downloadItem = () => {
      console.log('TODO implement download structured Data in JSON Format');
    };

    const openDialog = (index: number) => {
      menuItems.value[index].dialog = true;
    };

    const closeDialog = (index: number) => {
      menuItems.value[index].dialog = false;
    };

    return {
      menuItems,
      downloadItem,
      openDialog,
      closeDialog,
    };
  },
});
</script>

<style scoped>
.menu-item {
  cursor: pointer;
}
.menu-item:hover {
  background-color: #eeeeee;
}
</style>
