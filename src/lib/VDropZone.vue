<script lang="ts" setup>
import { computed, ref } from "vue";
import { Side } from "./types";
import { calculateSide } from "./useLayout";

const t = 10;

const { multi, disabled, stopPropagation } = defineProps({
  multi: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
  stopPropagation: { type: Boolean, required: false, default: false },
});

const emit = defineEmits(["on-drop"]);

const side = ref<Side | undefined>(undefined);

const classes = computed(() =>
  side.value ? `clv__drop-zone-active clv__drop-zone-${side.value}` : ""
);

const onDragOver = (ev: DragEvent) => {
  if (disabled) return;

  if (stopPropagation) {
    ev.stopPropagation();
  }

  ev.preventDefault();

  const $side = multi ? calculateSide(ev) : Side.Center;

  setTimeout(() => (side.value = $side), t);
};

const onDragLeave = (ev: DragEvent) => {
  if (disabled) return;

  if (stopPropagation) {
    ev.stopPropagation();
  }

  setTimeout(() => (side.value = undefined), t);
};

const onDrop = (ev: DragEvent) => {
  if (disabled) return;

  if (stopPropagation) {
    ev.stopPropagation();
  }

  setTimeout(() => (side.value = undefined), t);

  const $side = multi ? calculateSide(ev) : Side.Center;

  emit("on-drop", { side: $side, ev });
};

const onDrag = (ev: DragEvent) => {
  ev.preventDefault();
};
</script>

<template>
  <div
    class="clv__drop-zone"
    :class="classes"
    @drag="onDrag"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="clv__drop-zone-overlay" />
    <slot>Content Here...</slot>
  </div>
</template>

<style>
.clv__drop-zone {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1;
  position: relative;
}

.clv__drop-zone-active:after {
  content: "";
  position: absolute;
  display: none;
  background-color: var(--clv__drag-side-color);
  z-index: 2;
}

.clv__drop-zone-overlay {
  display: none;
  position: absolute;
  z-index: 1;
  inset: 0px;
  background-color: var(--clv__drag-overlay-color);
}

.clv__drop-zone-active .clv__drop-zone-overlay {
  display: block;
}

.clv__drop-zone-top::after {
  display: block;
  top: 0px;
  bottom: 60%;
  right: 0px;
  left: 0px;
}
.clv__drop-zone-bottom::after {
  display: block;
  top: 60%;
  bottom: 0px;
  right: 0px;
  left: 0px;
}
.clv__drop-zone-right::after {
  display: block;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 60%;
}
.clv__drop-zone-left::after {
  display: block;
  top: 0px;
  bottom: 0px;
  right: 60%;
  left: 0px;
}
.clv__drop-zone-center::after {
  display: block;
  inset: 0px;
}
</style>
