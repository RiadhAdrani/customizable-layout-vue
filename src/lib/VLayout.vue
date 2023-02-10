<script lang="ts" setup>
import { computed } from "vue";
import { Layout, Tab, UIType, Direction, Side, UseLayoutOutput, TabButtonSlotProps } from "./types";
import { getType, getTab, processDragData } from "./useLayout";
import VDropZone from "./VDropZone.vue";
import VTabButton from "./VTabButton.vue";
import VTabContent from "./VTabContent.vue";

const { options } = defineProps<{
  options: UseLayoutOutput;
}>();

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
  const data: Record<string, unknown> = processDragData(ev.dataTransfer?.getData("text"));

  options.actions.onDrop(data, options.tree.id, side);
};

const navDrop = ({ ev }: { ev: DragEvent }) => {
  const data: Record<string, unknown> = processDragData(ev.dataTransfer?.getData("text"));

  options.actions.onDrop(data, options.tree.id, Side.Center);
};

const emptyDrop = ({ ev }: { ev: DragEvent }) => {
  ev.preventDefault();

  const data: Record<string, unknown> = processDragData(ev.dataTransfer?.getData("text"));

  options.actions.onEmptyDrop(data);
};
</script>

<template>
  <div class="clv__layout-wrapper">
    <div v-if="isEmpty" class="clv__layout-empty">
      <VDropZone @on-drop="emptyDrop" :multi="false">
        <slot name="empty">Nothing here</slot>
      </VDropZone>
    </div>
    <div v-else-if="!forLayouts" class="clv__tabs-container">
      <div class="clv__tabs-container-bar">
        <VDropZone :multi="false" @on-drop="navDrop">
          <div class="clv__tabs-container-bar">
            <VTabButton
              v-for="item of (options.tree.children as Array<Tab>)"
              :active-id="options.tree.active!"
              :item="item"
              :key="item.id"
              @toggle-tab="toggle(item.id)"
              @close-tab="close(item.id)"
            >
              <template #default="props">
                <slot name="tab-btn" v-bind="props" />
              </template>
            </VTabButton>
          </div>
        </VDropZone>
      </div>
      <VTabContent @on-drop="drop" :colors="options.colors">
        <slot
          name="tab"
          v-bind="getTab(options.tree.active!,(options.tree.children as Array<Tab>))"
        />
      </VTabContent>
    </div>
    <div v-else-if="forLayouts" class="clv__layouts-container" :class="classList">
      <VLayout
        v-for="item in (options.tree.children as Array<Layout>)"
        :key="item.id"
        :options="{ tree: item, actions: options.actions, colors: options.colors }"
      >
        <template #tab="data">
          <slot name="tab" v-bind="(data as Tab)" />
        </template>
        <template #tab-btn="props">
          <slot name="tab-btn" v-bind="(props as TabButtonSlotProps)" />
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
