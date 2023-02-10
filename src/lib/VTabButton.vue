<script lang="ts" setup>
import { computed } from "vue";
import { Tab, DraggedTab, UIType } from "./types";
import VDropZone from "./VDropZone.vue";

const { item, activeId } = defineProps<{ item: Tab; activeId: string }>();

const emit = defineEmits(["toggle-tab", "close-tab"]);

const toggle = () => {
  emit("toggle-tab", item.id);
};

const close = () => {
  emit("close-tab", item.id);
};

const onDragStart = (e: DragEvent) => {
  const data: DraggedTab = {
    id: item.id,
    type: UIType.Tab,
    data: item.data,
    signature: "__dragged__tab__",
  };

  e.dataTransfer?.setData("text/plain", JSON.stringify(data));
};
</script>

<template>
  <div class="clv__tab-btn" draggable="true" @dragstart.stop="onDragStart">
    <VDropZone :multi="false">
      <template #default>
        <slot
          name="default"
          v-bind="{
            active: activeId === item.id,
            close,
            toggle,
            title: item.title,
            data: item.data,
          }"
        >
          <button class="clv__tab-btn-default" :data-active="activeId === item.id" @click="toggle">
            <span>{{ item.title }}</span>
            <span class="clv__tab-btn-default-close" @click.prevent="close">❌</span>
          </button>
        </slot>
      </template>
    </VDropZone>
  </div>
</template>

<style>
.clv__tab-btn {
  border-bottom: 1px solid transparent;
  border-radius: 5px 5px 0px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clv__tab-btn-default {
  border-bottom: 1px solid transparent;
  margin-right: 5px;
}

.clv__tab-btn-default-close {
  margin-left: 10px;
  font-size: 0.75em;
  padding: 0.3em;
}

.clv__tab-btn-default-close:hover {
  background-color: black;
}

.clv__tab-btn-default[data-active="true"] {
  border-bottom-color: white;
  background-color: #1a1a1a;
}
</style>
