<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";
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

  if (!options.tree.parent) {
    list.push("clv__layout-root");
  }

  if (options.tree.direction === Direction.Row) {
    list.push("clv__layout-container-row");
  }

  if (options.tree.direction === Direction.Column) {
    list.push("clv__layout-container-col");
  }

  return list.join(" ");
});

const resizeHandle = computed<string>(() => {
  const parent = options.tree.parent;

  const list: Array<string> = [];

  if (
    parent &&
    parent.children.indexOf(options.tree as Layout<Tab>) !== parent.children.length - 1
  ) {
    list.push(`clv__layout-handle-${parent.direction}`);
  }

  if (!parent) {
    list.push("clv__layout-root");
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

const onMouseDown = () => {
  handling.value = true;
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
  const index = parent.children.indexOf(options.tree as Layout<Tab>);

  const nEl = parent.children[index + 1];

  const pEl = document.getElementById(`clv__layout-id-${parent.id}`)!;
  const el = document.getElementById(`clv__layout-id-${options.tree.id}`)!;
  const hEl = el.querySelectorAll(":scope > .clv__layout-handle").item(0) as HTMLElement;

  const hRect = hEl.getBoundingClientRect();

  if (parent.direction === Direction.Row) {
    const diff = ev.clientX - (hRect.x - hRect.width / 2);

    if (Math.abs(diff) < 10) {
      return;
    }

    const pRect = pEl.getBoundingClientRect();
    const ratio = Math.abs(diff) / pRect.width;
    const sum = parent.children.reduce((s, r) => s + r.ratio, 0);

    if (diff > 0) {
      // TODO : we need to search for the next element where reducing its size is possible
      // and apply ratio modification

      // TODO : we need to check if all other element are minimal

      if (sum / 5 >= nEl.ratio) {
        return;
      }

      options.tree.ratio += ratio;
      nEl.ratio -= ratio;
    } else {
      if (sum / 5 >= options.tree.ratio) {
        return;
      }

      options.tree.ratio -= ratio;
      nEl.ratio += ratio;
    }
  } else {
    const diff = ev.clientY - (hRect.y - hRect.height / 2);

    if (Math.abs(diff) < 10) {
      return;
    }

    const pRect = pEl.getBoundingClientRect();
    const ratio = Math.abs(diff) / pRect.height;
    const sum = parent.children.reduce((s, r) => s + r.ratio, 0);

    if (diff > 0) {
      // TODO : we need to search for the next element where reducing its size is possible
      // and apply ratio modification

      if (sum / 5 >= nEl.ratio) {
        return;
      }

      options.tree.ratio += ratio;
      nEl.ratio -= ratio;
    } else {
      if (sum / 5 >= options.tree.ratio) {
        return;
      }

      options.tree.ratio -= ratio;
      nEl.ratio += ratio;
    }
  }
};

const updateDimensions = () => {
  const el = document.getElementById(`clv__layout-id-${options.tree.id}`)!;

  if (!options.tree.parent) {
    return;
  }

  const pEl = document.getElementById(`clv__layout-id-${options.tree.parent!.id}`)!;

  const sum = options.tree.parent.children.reduce((s, r) => s + r.ratio, 0);

  if (options.tree.parent.direction === Direction.Row) {
    const width = (pEl.offsetWidth / sum) * options.tree.ratio;

    el.style.flexBasis = `${width}px`;
  } else {
    const height = (pEl.offsetHeight / sum) * options.tree.ratio;
    el.style.flexBasis = `${height}px`;
  }
};

watch(
  () => [options.tree.ratio, options.tree.parent?.children.length],
  () => updateDimensions(),
  { flush: "post" }
);

onMounted(() => {
  window.addEventListener("mouseup", unHandle);
  window.addEventListener("mouseleave", unHandle);
  window.addEventListener("blur", unHandle);
  window.addEventListener("mousemove", onMouseMove);

  updateDimensions();
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
  transition-duration: 150ms;
}

.clv__layout-handle:hover {
  background-color: var(--clv__handle-hover);
}

.clv__layout-handle:active {
  background-color: var(--clv__handle-active);
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
