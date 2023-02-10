<script lang="ts" setup>
import { computed } from "vue";
import { Layout, Tab, UIType, Direction, Side, UseLayoutOutput } from "./types";
import { getType, getTab } from "./useLayout";
import VTabButton from "./VTabButton.vue";
import VTabContent from "./VTabContent.vue";

const { options } = defineProps<{
  options: UseLayoutOutput;
}>();

if ((options.tree.type as any) === UIType.Tab) {
  console.log(options.tree);
}

const forLayouts = computed(() => getType(options.tree.children) === UIType.Layout);

const isEmpty = computed(() => options.tree.children.length === 0);

const classList = computed(() => {
  const list = [];

  if (options.tree.direction === Direction.Row) {
    list.push("clv__layout-container-row");
  }
  if (options.tree.direction === Direction.Column) {
    list.push("clv__layout-container-col");
  }

  return list.join(" ");
});

const toggle = (id: string) => {
  options.actions.toggleTab(id);
};

const close = (id: string) => {
  options.actions.closeTab(id);
};

const drop = ({ side, ev }: { ev: DragEvent; side: Side }) => {
  let data: Record<string, unknown> = {};

  try {
    data = JSON.parse(ev.dataTransfer?.getData("text") ?? "{}");
  } catch (error) {}

  options.actions.onDrop(data, options.tree.id, side);
};

const emptyDrop = (ev: DragEvent) => {
  ev.preventDefault();

  let data: Record<string, unknown> = {};

  try {
    data = JSON.parse(ev.dataTransfer?.getData("text") ?? "{}");
  } catch (error) {}

  options.actions.onEmptyDrop(data);
};
</script>

<template>
  <div class="clv__layout-wrapper">
    <!-- TODO allow dropping of tabs here  -->
    <div v-if="isEmpty" class="clv__layout-empty" @dragover.prevent @drop="emptyDrop">
      <slot name="empty">Nothing here</slot>
    </div>
    <div v-else-if="!forLayouts" class="clv__tabs-container">
      <div class="clv__tabs-container-bar">
        <!-- TODO allow dropping of tabs here  -->
        <VTabButton
          v-for="item of (options.tree.children as Array<Tab>)"
          :active-id="options.tree.active!"
          :item="item"
          :key="item.id"
          @toggle-tab="toggle(item.id)"
          @close-tab="close(item.id)"
        />
      </div>
      <VTabContent @on-drop="drop" :colors="options.colors">
        <slot
          name="tab"
          v-bind="getTab(options.tree.active!,(options.tree.children as Array<Tab>))"
        ></slot>
      </VTabContent>
    </div>
    <div v-else-if="forLayouts" class="clv__layouts-container" :class="classList">
      <VLayout
        v-for="item in (options.tree.children as Array<Layout>)"
        :key="item.id"
        :options="{ tree: item, actions: options.actions, colors: options.colors }"
      >
        <template #tab="data">
          <slot name="tab" v-bind="(data as Tab)"></slot>
        </template>
      </VLayout>
    </div>
  </div>
</template>

<style>
.clv__layout-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 2px;
}

.clv__tabs-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.clv__tabs-container-bar {
  display: flex;
  flex-direction: row;
}

.clv__tab-btn {
  border-bottom: 1px solid transparent;
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6em 0.8em;
  background-color: #202020;
}

.clv__tab-btn-close {
  margin-left: 10px;
  font-size: 0.75em;
  padding: 0.3em;
}

.clv__tab-btn-close:hover {
  background-color: black;
}

.clv__tab-btn[data-active="true"] {
  border-bottom-color: white;
  background-color: #1a1a1a;
}

.clv__layouts-container {
  display: flex;
  flex: 1;
}

.clv__layout-container-row {
  flex-direction: row;
}
.clv__layout-container-col {
  flex-direction: column;
}
</style>
