<template>
  <div>Calendar with {{ listType }}</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CalendarList',
  props: {
    listType: {
      type: String,
      required: true,
    },
  },
});
</script>
