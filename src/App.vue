<script setup lang="ts">
import { Direction } from "./lib/types";
import { VLayout, useLayout, createLayout, createTab } from "./lib";

const { options } = useLayout(
  createLayout({
    direction: Direction.Column,
    children: [
      createLayout({ children: [createTab({ title: "Hello" })] }),
      createLayout({ children: [createTab({ title: "Hello" })] }),
    ],
  }),
  {
    onUnknownDropped() {
      return createTab({ title: "Tab", data: { text: "Custom Tab" } });
    },
    areSameTab() {
      return false;
    },
  }
);
</script>

<template>
  <VLayout :options="options">
    <template #tab>
      <div class="hello">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo inventore culpa omnis. Eveniet
        deleniti odio velit fuga explicabo vitae unde dignissimos nemo, neque accusamus, iure rem at
        ab, facere ipsum?
      </div>
    </template>
    <template #empty>
      <h2 class="empty-layout">Drag Anything here to get started.</h2>
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
  overflow: auto;
}

.empty-layout {
  margin: auto 0px;
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
