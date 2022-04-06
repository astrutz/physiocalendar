<template>
  <v-app-bar app color="#2a2f79" dark>
    <img src="@/assets/icon-inverted.png" height="50px" class="mr-4" />
    <div class="d-flex align-center">
      <h1 class="text-h4">Physiokalender - Praxis Meyer</h1>
    </div>
    <v-spacer></v-spacer>
    <Menu />
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Menu from '@/components/Menu.vue';

@Component({
  components: {
    Menu,
  },
})

export default class AppBar extends Vue {
}

</script>
