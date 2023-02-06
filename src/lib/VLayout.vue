<script lang="ts" setup>
import { computed } from "vue";
import {
  Layout,
  Tab,
  UIType,
  LayoutActions,
  Direction,
  Side,
  DraggedTab,
  TabTemplate,
} from "./types";
import { getType, getTab, createTab, findUiByPath, getRoot } from "./useLayout";
import VTabButton from "./VTabButton.vue";
import VTabContent from "./VTabContent.vue";

const { template, actions } = defineProps<{
  template: Layout<Tab | Layout>;
  actions: LayoutActions;
}>();

const forLayouts = computed(() => getType(template.children) === UIType.Layout);

const isEmpty = computed(() => template.children.length === 0);

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

const dropped = ({ side, ev }: { ev: DragEvent; side: Side }) => {
  // TODO : create tab with events.onDrop
  let data: Record<string, unknown> = {};
  let tab: TabTemplate | undefined = undefined;

  try {
    data = JSON.parse(ev.dataTransfer?.getData("text") ?? "{}");
  } catch (error) {}

  if (
    data.type === UIType.Tab &&
    data.signature === "__dragged__tab__" &&
    typeof data.id === "string" &&
    Array.isArray(data.parents)
  ) {
    const $data = data as unknown as DraggedTab;
    // TODO : we should remove the tab from its original position and create it here

    const $tab = findUiByPath(
      $data.id,
      $data.parents,
      getRoot(template) as unknown as Layout<Layout>
    ) as Tab;

    actions.useCloseTab($tab.id, $tab.parent);

    tab = createTab($data);
  } else {
    // TODO : allow user to create tab with drag event
  }

  if (tab) {
    actions.useOnDrop(tab, template as Layout, side);
  }
};
</script>

<template>
  <div class="clv__layout-wrapper">
    <!-- TODO allow dropping of tabs here  -->
    <div v-if="isEmpty">Try dropping something here...</div>
    <div v-else-if="!forLayouts" class="clv__tabs-container">
      <div class="clv__tabs-container-bar">
        <!-- TODO allow dropping of tabs here  -->
        <VTabButton
          v-for="item of (template.children as Array<Tab>)"
          :active-id="template.active!"
          :item="item"
          :key="item.id"
          @toggle-tab="toggle(item.id)"
          @close-tab="close(item.id)"
        />
      </div>
      <VTabContent @on-drop="dropped">
        <slot name="tab" v-bind="getTab(template.active!,(template.children as Array<Tab>))"></slot>
      </VTabContent>
    </div>
    <div v-else class="clv__layouts-container" :class="classList">
      <VLayout
        v-for="item in (template.children as Array<Layout>)"
        :key="item.id"
        :template="item"
        :actions="actions"
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
