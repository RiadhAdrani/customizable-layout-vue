<script setup lang="ts">
import { Direction } from "./lib/types";
import useLayout, { createLayout, createTab } from "./lib/useLayout";
import VLayout from "./lib/VLayout.vue";

const { options } = useLayout(
  createLayout({
    direction: Direction.Column,
    children: [
      createLayout({
        children: [createTab({ title: "Hello" })],
      }),
      createLayout({
        children: [createTab({ title: "2" })],
      }),
    ],
  }),
  {
    onUnknownDropped(data: Record<string, unknown>) {
      return createTab({ title: "Data", data });
    },
    areSameTab() {
      return false;
    },
  }
);
</script>

<template>
  <VLayout :options="options">
    <template #tab="props">
      <div>
        <h3>{{ props.id }}</h3>
      </div>
    </template>
  </VLayout>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
