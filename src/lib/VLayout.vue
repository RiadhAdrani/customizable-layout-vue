<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Layout, Tab, UIType, Direction, Side, UseLayoutOutput, TabButtonSlotProps } from "./types";
import { getType, getTab, processDragData } from "./useLayout";
import VDropZone from "./VDropZone.vue";
import VTabButton from "./VTabButton.vue";
import VTabContent from "./VTabContent.vue";

const { options } = defineProps<{
  options: UseLayoutOutput;
}>();

const handling = ref(false);

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

const resizeHandle = computed(() => {
  const parent = options.tree.parent;

  if (
    !parent ||
    parent.children.indexOf(options.tree as Layout<Tab>) === parent.children.length - 1
  ) {
    return "";
  }

  return `clv__layout-handle-${parent.direction}`;
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

const onMouseDown = () => {
  handling.value = true;

  const pEl = document.getElementById(`clv__layout-id-${options.tree.parent!.id}`)!;

  // we need to go through all element and set element width;
  options.tree.parent!.children.forEach((child) => {
    const childEl = document.getElementById(`clv__layout-id-${child.id}`)! as HTMLElement;

    if (!childEl.style.width) {
      const w = pEl.getBoundingClientRect().width / options.tree.parent!.children.length;

      childEl.style.width = `${w}px`;
    }
  });
};

const unHandle = () => {
  handling.value = false;
  document.body.ondragstart = null;
  document.body.style.cursor = "";
};

const onMouseMove = (ev: MouseEvent) => {
  if (!handling.value) {
    return;
  }

  document.body.style.cursor =
    options.tree.parent!.direction === Direction.Row ? "col-resize" : "row-resize";

  document.body.ondragstart = () => false;

  const parent = options.tree.parent!;
  const nextElId = parent.children[parent.children.indexOf(options.tree as Layout<Tab>) + 1].id;

  const el = document.getElementById(`clv__layout-id-${options.tree.id}`)!;
  const nextEl = document.getElementById(`clv__layout-id-${nextElId}`)!;

  const hRect = (
    el.getElementsByClassName("clv__layout-handle").item(0) as HTMLElement
  ).getBoundingClientRect();

  if (parent.direction === Direction.Row) {
    const diff = ev.clientX - (hRect.x - hRect.width / 2);

    // drag position-x delta should be (20px)
    if (Math.abs(diff) < 10) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const nextRect = nextEl.getBoundingClientRect();

    // TODO : need to check if minimum width for both element or next sibling is reached.

    if (diff > 0) {
      // drag position x is superior to handle ->
      // we append the delta to the layout

      el.style.width = `${rect.width + diff}px`;
      nextEl.style.width = `${nextRect.width - Math.abs(diff)}px`;
    } else {
      // drag position x is inferior to handle <-
      // we append the delta to the next layout

      nextEl.style.width = `${nextRect.width + Math.abs(diff)}px`;
      el.style.width = `${rect.width - Math.abs(diff)}px`;
    }
  } else {
  }
};

onMounted(() => {
  window.addEventListener("mouseup", unHandle);
  window.addEventListener("mouseleave", unHandle);
  window.addEventListener("blur", unHandle);
  window.addEventListener("mousemove", onMouseMove);
});

onBeforeUnmount(() => {
  window.removeEventListener("blur", unHandle);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", unHandle);
  window.removeEventListener("mouseleave", unHandle);
});
</script>

<template>
  <div class="clv__layout-wrapper" :id="`clv__layout-id-${options.tree.id}`" :class="resizeHandle">
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
    <div v-if="resizeHandle !== ''" class="clv__layout-handle" @mousedown="onMouseDown" />
  </div>
</template>

<style>
:root {
  --clv__handle-hover: #3e3e3e;
  --clv__handle-active: #00000099;
}

.clv__layout-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  padding: 2px;
  position: relative;
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

.clv__layout-handle {
  padding: 5px;
  position: absolute;
}

.clv__layout-handle:hover {
  background-color: var(--clv__handle-hover);
}

.clv__layout-handle:active {
  background-color: var(--clv__handle-active);
}

.clv__layout-handle-column {
  min-height: 10%;
}

.clv__layout-handle-row {
  min-width: 10%;
}

.clv__layout-handle-column > .clv__layout-handle {
  cursor: row-resize;
  right: 0;
  bottom: 0;
  left: 0;
}

.clv__layout-handle-row > .clv__layout-handle {
  cursor: col-resize;
  right: 0;
  bottom: 0;
  top: 0;
}
</style>
