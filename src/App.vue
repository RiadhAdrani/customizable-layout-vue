<script setup lang="ts">
import { Direction } from "./lib/types";
import useLayout, { createLayout, createTab } from "./lib/useLayout";
import VLayout from "./lib/VLayout.vue";

const { tree, actions } = useLayout(
  createLayout({
    direction: Direction.Column,
    id: "1",
    children: [
      createLayout({
        id: "1-1",
        children: [
          createTab({ title: "Tab 1", id: "1" }),
          createTab({ title: "Tab 2", id: "2" }),
          createTab({ title: "Tab 3", id: "3" }),
        ],
      }),
      createLayout({
        id: "1-2",
        children: [createTab({ title: "Hello", id: "4" })],
      }),
    ],
  })
);
</script>

<template>
  <VLayout :template="tree" :actions="actions">
    <template #tab="props">
      <div>
        {{ props.id }} => Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perspiciatis
        quis eveniet consequuntur vel! Ducimus, eligendi? Et laboriosam reiciendis magni quidem cum,
        iste veritatis nam vero accusantium? Odit, facilis. Ipsam, at.
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
