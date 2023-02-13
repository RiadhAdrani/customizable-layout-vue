<script setup lang="ts">
import { Direction } from "./lib/types";
import { VLayout, useLayout, createLayout, createTab } from "./lib";

const { startTab, options } = useLayout(
  createLayout({
    direction: Direction.Row,
    children: [
      createLayout({ children: [createTab({ title: "Hello", data: { text: "Hello, World" } })] }),
      createLayout({ children: [createTab({ title: "Hello", data: { text: "Hello, World" } })] }),
      createLayout({ children: [createTab({ title: "Hello", data: { text: "Hello, World" } })] }),
    ],
  }),
  {
    onUnknownDropped() {
      return createTab({ title: "Data", data: { text: "Custom Tab" } });
    },
    areSameTab() {
      return false;
    },
  }
);

const onClick = () => {
  startTab(createTab({ title: "Newest Tab", data: {} }));
};
</script>

<template>
  <button draggable="true">drag me</button>
  <br />
  <button @click="onClick">Start new Tab</button>
  <br />
  <VLayout :options="options">
    <template #tab="tab">
      <div class="hello">{{ tab.data!.text }}</div>
    </template>
    <template #empty>
      <h1>Drag something here :)</h1>
    </template>
    <template #tab-btn="{ active, title, toggle, close }">
      <button @click="toggle" @contextmenu.prevent="close">
        {{ title }} {{ active ? "✅" : "" }}
      </button>
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
