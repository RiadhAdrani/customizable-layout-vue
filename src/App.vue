<script setup lang="ts">
import { Direction } from "./lib/types";
import useLayout, { createLayout, createTab } from "./lib/useLayout";
import VLayout from "./lib/VLayout.vue";

const { options } = useLayout(
  createLayout({
    direction: Direction.Column,
    children: [
      createTab({ title: "Hello", data: { text: "Hello, World" } }),
      createTab({ title: "World", data: { text: "World, Hello" } }),
    ],
  }),
  {
    onUnknownDropped() {
      return createTab({ title: "Data", data: { text: "Custom Tab" } });
    },
    areSameTab() {
      return false;
    },
    colors: {
      contentOverlay: "red",
      contentSide: "blue",
    },
  }
);
</script>

<template>
  <button draggable="true">drag me</button>
  <VLayout :options="options">
    <template #tab="props">
      <div class="hello">{{ props.data!.text }}</div>
    </template>
    <template #empty>
      <h1>Drag something here :)</h1>
    </template>
  </VLayout>
</template>

<style scoped>
.hello {
  padding: 10px;
  background: #1e1e1e;
  flex: 1;
}
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
