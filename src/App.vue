<script setup lang="ts">
import { Direction } from "./lib/types";
import useLayout, { createLayout, createTab } from "./lib/useLayout";
import VLayout from "./lib/VLayout.vue";

const options = useLayout(
  createLayout({
    direction: Direction.Column,
    children: [
      createLayout({
        children: [createTab({ title: "Tab 1" })],
      }),
      createLayout({
        children: [
          createLayout({
            children: [createTab({ title: "Tab 3" })],
          }),
          createLayout({
            children: [createTab({ title: "Tab 5" })],
          }),
        ],
      }),
      createLayout({
        children: [createTab({ title: "Tab 7" })],
      }),
    ],
  }),
  {
    createTab(data) {
      return undefined;
    },
  }
);
</script>

<template>
  <VLayout :options="options">
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
