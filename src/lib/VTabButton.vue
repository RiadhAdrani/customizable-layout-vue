<script lang="ts" setup>
import { Tab, DraggedTab, UIType } from "./types";

const { item } = defineProps<{ item: Tab; activeId: string }>();

const emit = defineEmits(["toggle-tab", "close-tab"]);

const toggle = () => {
  emit("toggle-tab", item.id);
};

const close = () => {
  emit("close-tab", item.id);
};

const onDragStart = (e: DragEvent) => {
  const data: DraggedTab = {
    id: item.id,
    type: UIType.Tab,
    data: item.data,
    signature: "__dragged__tab__",
  };

  e.dataTransfer?.setData("text/plain", JSON.stringify(data));
};
</script>

<template>
  <button
    class="clv__tab-btn"
    draggable="true"
    @dragstart.stop="onDragStart"
    @click="toggle"
    :data-active="activeId === item.id"
  >
    <span>{{ item.title }}</span>
    <span class="clv__tab-btn-close" @click.prevent="close">❌</span>
  </button>
</template>
