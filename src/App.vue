<script setup lang="ts">
import { Direction } from "./lib/types";
import useLayout, { createLayout, createTab } from "./lib/useLayout";
import VLayout from "./lib/VLayout.vue";

const { options } = useLayout(
  createLayout({
    direction: Direction.Column,
    children: [
      createTab({ title: "Hello", data: { id: "Hello World" } }),
      createTab({ title: "2" }),
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
  <button draggable="true">drag me</button>
  <VLayout :options="options">
    <template #tab="props">
      <div>
        <h3>{{ props.data }}</h3>
      </div>
    </template>
    <template #empty>
      <h1>Drag something here :)</h1>
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
