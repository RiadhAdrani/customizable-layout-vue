<script lang="ts" setup>
import { Tab } from "./types";

const { item } = defineProps<{ item: Tab; activeId: string }>();

const emit = defineEmits(["toggle-tab", "close-tab"]);

const toggle = () => {
  emit("toggle-tab", item.id);
};

const close = () => {
  emit("close-tab", item.id);
};
</script>

<template>
  <button class="clv__tab-btn" draggable="true" @click="toggle" :data-active="activeId === item.id">
    <span>{{ item.title }}</span>
    <span class="clv__tab-btn-close" @click.prevent="close">❌</span>
  </button>
</template>
