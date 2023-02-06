<script setup lang="ts">
import { Direction, Tab } from "./lib/types";
import useLayout, { createLayout, createTab } from "./lib/useLayout";
import VLayout from "./lib/VLayout.vue";

const { tree, actions } = useLayout(
  createLayout({
    direction: Direction.Column,
    children: [
      createLayout({
        children: [createTab({ title: "Tab 1" }), createTab({ title: "Tab 2" })],
      }),
      createLayout({
        children: [
          createLayout({
            children: [createTab({ title: "Tab 3" }), createTab({ title: "Tab 4" })],
          }),
          createLayout({
            children: [createTab({ title: "Tab 5" }), createTab({ title: "Tab 6" })],
          }),
        ],
      }),
      createLayout({
        children: [createTab({ title: "Tab 7" })],
      }),
    ],
  })
);
</script>

<template>
  <VLayout :template="tree" :actions="actions">
    <template #tab="props">
      <div>
        {{ props.title }} => Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perspiciatis
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
