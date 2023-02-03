<script lang="ts" setup>
import { computed } from "vue";
import { Layout, Tab, UIType, LayoutActions, Direction } from "./types";
import { getType, getTab } from "./useLayout";
import VTabButton from "./VTabButton.vue";

const { template, actions } = defineProps<{
  template: Layout<Tab | Layout>;
  actions: LayoutActions;
}>();

const forLayouts = getType(template.children) === UIType.Layout;

const classList = computed(() => {
  const list = [];

  if (template.direction === Direction.Row) {
    list.push("clv__layout-container-row");
  }
  if (template.direction === Direction.Column) {
    list.push("clv__layout-container-col");
  }

  return list.toString();
});

const toggle = (id: string) => {
  actions.useToggleTab(id, template as Layout);
};

const close = (id: string) => {
  actions.useCloseTab(id, template as Layout);
};
</script>

<template>
  <div class="clv__layout-wrapper">
    <div v-if="!forLayouts" class="clv__tabs-container">
      <div class="clv__tabs-container-bar">
        <VTabButton
          v-for="item of (template.children as Array<Tab>)"
          :active-id="template.active!"
          :item="item"
          :key="item.id"
          @toggle-tab="toggle(item.id)"
          @close-tab="close(item.id)"
        />
      </div>
      <div class="clv__tabs-content">
        <slot name="tab" v-bind="getTab(template.active!,(template.children as Array<Tab>))"
          >Tab Goes Here</slot
        >
      </div>
    </div>
    <div v-if="forLayouts" class="clv__layouts-container" :class="classList">
      <VLayout
        v-for="item in (template.children as Array<Layout>)"
        :key="item.id"
        :template="item"
        :actions="actions"
      >
        <template #tab="data">
          <slot name="tab" v-bind="(data as Tab)">Tab Goes Here</slot>
        </template>
      </VLayout>
    </div>
  </div>
</template>

<style>
.clv__layout-wrapper {
  display: flex;
  flex-direction: column;
}

.clv__tabs-container {
  display: flex;
  flex-direction: column;
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

.clv__tabs-content {
  padding: 10px;
}

.clv__layouts-container {
  display: flex;
}

.clv__layout-container-row {
  flex-direction: row;
}
.clv__layout-container-col {
  flex-direction: column;
}
</style>
