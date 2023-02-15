import { App } from "vue";
import VLayout from "./VLayout.vue";
import VDropZone from "./VDropZone.vue";
import VTabButton from "./VTabButton.vue";
import VTabContent from "./VTabContent.vue";

export * from "./types";
export { default as useLayout, createTab as tab, createLayout as layout } from "./useLayout";
export { VLayout };

export const CLV = {
  install(vue: App) {
    vue.component("VDropZone", VDropZone);
    vue.component("VTabButton", VTabButton);
    vue.component("VTabContent", VTabContent);
    vue.component("VLayout", VLayout);
  },
};
