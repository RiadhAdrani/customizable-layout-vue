<script lang="ts" setup>
import VDropZone from "./VDropZone.vue";

const emit = defineEmits(["on-drop"]);

const onDrop = (data: any) => {
  emit("on-drop", data);
};
</script>

<template>
  <div class="clv__tab-content">
    <VDropZone @on-drop="onDrop">
      <template #default>
        <slot>Tab Content Here</slot>
      </template>
    </VDropZone>
  </div>
</template>

<style>
.clv__tab-content {
  display: flex;
  flex: 1;
  border-radius: 5px;
  position: relative;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
</style>
