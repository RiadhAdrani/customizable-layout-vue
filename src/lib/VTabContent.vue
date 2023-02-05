<script lang="ts" setup>
import { computed, ref } from "vue";
import { Side } from "./types";
import { calculateSide } from "./useLayout";

const emit = defineEmits(["on-drop"]);

const dragData = ref<Side | undefined>(undefined);

const dragClassList = computed(() => {
  const list: Array<string> = [];

  if (dragData.value) {
    list.push("clv__tab-content-dragged-over", `clv__tab-content-dragged-over-${dragData.value}`);
  }

  return list.join(" ");
});

const onDragOver = (ev: DragEvent) => {
  ev.preventDefault();

  const side = calculateSide(ev);

  setTimeout(() => {
    dragData.value = side;
  }, 5);
};

const onDragLeave = () => {
  setTimeout(() => {
    dragData.value = undefined;
  }, 5);
};

const onDrop = (ev: DragEvent) => {
  setTimeout(() => {
    dragData.value = undefined;
  }, 5);

  const side = calculateSide(ev);

  emit("on-drop", { side, ev });
};

const onDrag = (ev: DragEvent) => {
  ev.preventDefault();
};
</script>

<template>
  <div
    class="clv__tab-content"
    :class="dragClassList"
    @drag="onDrag"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="clv__tab-content-overlay" />
    <slot>Tab Content Here</slot>
  </div>
</template>

<style>
.clv__tab-content {
  padding: 10px;
  flex: 1;
  background-color: #1e1e1e;
  border-radius: 5px;
  position: relative;
}

.clv__tab-content-dragged-over:after {
  content: "";
  position: absolute;
  display: block;
  background-color: #000000aa;
  z-index: 2;
}

.clv__tab-content-overlay {
  display: none;
  position: absolute;
  z-index: 1;
  inset: 0px;
  background-color: #0000ff11;
}

.clv__tab-content-dragged-over .clv__tab-content-overlay {
  display: block;
}

.clv__tab-content::after {
  content: "";
  position: absolute;
  display: none;
  background-color: #000000aa;
  z-index: 2;
}

.clv__tab-content-dragged-over-top::after {
  display: block;
  top: 0px;
  bottom: 60%;
  right: 0px;
  left: 0px;
}
.clv__tab-content-dragged-over-bottom::after {
  display: block;
  top: 60%;
  bottom: 0px;
  right: 0px;
  left: 0px;
}
.clv__tab-content-dragged-over-right::after {
  display: block;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 60%;
}
.clv__tab-content-dragged-over-left::after {
  display: block;
  top: 0px;
  bottom: 0px;
  right: 60%;
  left: 0px;
}
.clv__tab-content-dragged-over-center::after {
  display: block;
  inset: 0px;
}
</style>
