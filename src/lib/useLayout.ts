import { reactive } from "vue";
import {
  Layout,
  LayoutTemplate,
  Tab,
  TabTemplate,
  UIType,
  CreateLayoutTemplate,
  CreateTabTemplate,
  Direction,
  LayoutActions,
} from "./types";
import { v4 as useId } from "uuid";

export const createTab = (params: CreateTabTemplate): TabTemplate => ({
  ...params,
  type: UIType.Tab,
});

export const createLayout = (params: CreateLayoutTemplate): LayoutTemplate => ({
  ...params,
  type: UIType.Layout,
});

export const getType = (children: Array<Tab | Layout>): UIType => {
  if (children.every((item) => item.type === UIType.Tab)) {
    return UIType.Tab;
  } else if (children.every((item) => item.type === UIType.Layout)) {
    return UIType.Layout;
  }

  throw "Unexpected State (getType): Layout children cannot be a mix of Tabs and Layouts.";
};

export const getTab = (id: string, children: Array<Tab>): Tab => {
  const tab = children.find((item) => item.id === id);

  if (!tab) {
    throw `Unexpected State (getTab): Unable to get tab with id "${id}"`;
  }

  return tab;
};

export const findTab = (id: string, layout: Layout<Tab | Layout>): Tab | undefined => {
  const type = getType(layout.children);

  if (type === UIType.Tab) {
    return (layout.children as Array<Tab>).find((item) => item.id === id);
  } else if (type === UIType.Layout) {
    for (let item of layout.children as Array<Layout>) {
      const found = findTab(id, item);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
};

export const getRoot = (layout: Layout): Layout => {
  return layout.parent ? getRoot(layout.parent) : layout;
};

export const transformTabTemplate = (params: TabTemplate, parent: Layout): Tab => {
  return { ...params, parent, id: params.id ?? useId() };
};

export const transformLayoutTemplate = (template: LayoutTemplate, parent?: Layout): Layout => {
  const layout: Layout = {
    ...template,
    children: [],
    parent,
    id: template.id ?? useId(),
    direction: template.direction ?? Direction.Row,
  };

  if (template.children.length === 0) {
    throw "Unexpected State (transformLayoutTemplate): Layout children should have at least 1 tab, or 2 layouts.";
  }

  if ((template.children as Array<TabTemplate>).every((child) => child.type === UIType.Tab)) {
    const children = template.children as Array<TabTemplate>;

    layout.children = children.map((child) => transformTabTemplate(child, layout));
    layout.active = layout.children[0].id;
  } else if (
    (template.children as Array<LayoutTemplate>).every((child) => child.type === UIType.Layout)
  ) {
    const children = template.children as Array<LayoutTemplate>;

    if (children.length < 2) {
      throw "Invalid Parameters (transformLayoutTemplate): Layout children should be 2 or more.";
    }

    (layout.children as unknown as Array<Layout>) = children.map((child) =>
      transformLayoutTemplate(child, layout)
    );
  } else {
    throw "Unexpected State: Layout children cannot be a mix of Tabs and Layouts.";
  }

  return layout;
};

export const useToggleTab = (id: string, layout: Layout): void => {
  if (getType(layout.children) === UIType.Layout) {
    throw "Unexpected Function Call (useToggleTab): cannot toggle tabs in a Layout of layouts.";
  }

  if (layout.active !== id) {
    layout.active = id;
  }
};

export const useCloseTab = (id: string, layout: Layout): void => {
  if (getType(layout.children) === UIType.Layout) {
    throw "Unexpected Function Call (useCloseTab): cannot close tabs in a Layout of layouts.";
  }

  if (!layout.children.find((tab) => tab.id === id)) {
    throw `Unexpected State (useCloseTab: Tab with id "${id}" does not exist.`;
  }

  const newChildren = layout.children.filter((item) => item.id !== id);

  layout.children = newChildren;

  if (newChildren.length === 0) {
    if (layout.parent) {
      layout.parent.children = layout.parent.children.filter((child) => child.id !== layout.id);
    }
  } else {
    if (layout.active === id) {
      layout.active = layout.children[0].id;
    }
  }
};

export default (layout: LayoutTemplate) => {
  const tree = reactive(transformLayoutTemplate(layout));

  const actions: LayoutActions = {
    useToggleTab,
    useCloseTab,
  };

  return { tree, actions };
};
