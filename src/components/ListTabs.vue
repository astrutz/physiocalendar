<template>
  <div class="mt-4">
    <CalendarList listType="daylist" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CalendarList from './CalendarList.vue';

export default defineComponent({
  components: {
    CalendarList,
  },
});
</script>
