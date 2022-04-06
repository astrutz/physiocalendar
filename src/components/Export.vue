<template>
    <v-card>
      <v-card-title class="text-h5">
        Use Google's location service?
      </v-card-title>

      <v-card-text>
        Let Google help apps determine location. This means sending anonymous
        location data to Google, even when no apps are running.
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn color="green darken-1" text @click="$emit('dialogClosed')">
          Disagree
        </v-btn>

        <v-btn color="green darken-1" text @click="$emit('dialogClosed')">
          Agree
        </v-btn>
      </v-card-actions>
    </v-card>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Export extends Vue {
}

</script>
