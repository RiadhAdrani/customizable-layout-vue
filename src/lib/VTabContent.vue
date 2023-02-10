<script lang="ts" setup>
import { LayoutColorOptions } from "./types";
import VDropZone from "./VDropZone.vue";

const { colors } = defineProps<{ colors: LayoutColorOptions }>();

const emit = defineEmits(["on-drop"]);

const onDrop = (data: any) => {
  emit("on-drop", data);
};
</script>

<template>
  <div class="clv__tab-content">
    <VDropZone
      @on-drop="onDrop"
      :side-color="colors.contentSide"
      :overlay-color="colors.contentOverlay"
    >
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
  background-color: #1e1e1e;
  border-radius: 5px;
  position: relative;
}
</style>
