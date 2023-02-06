import { reactive } from "vue";
import { clamp, isInInterval } from "@riadh-adrani/utility-js";
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
  Side,
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

export const transformTabTemplate = (params: TabTemplate, parent: Layout): Tab => {
  return { ...params, parent, id: params.id ?? useId() };
};

export const transformLayoutTemplate = (
  template: LayoutTemplate,
  parent?: Layout<Layout>
): Layout => {
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

    const ids = new Set(layout.children.map((item) => item.id));

    // TODO throw error with the duplicate id.

    if (ids.size !== layout.children.length) {
      throw `Duplicate Id: Duplicate id found.`;
    }

    layout.active = layout.children[0].id;
  } else if (
    (template.children as Array<LayoutTemplate>).every((child) => child.type === UIType.Layout)
  ) {
    const children = template.children as Array<LayoutTemplate>;

    if (children.length < 2) {
      throw "Invalid Parameters (transformLayoutTemplate): Layout children should be 2 or more.";
    }

    (layout.children as unknown as Array<Layout>) = children.map((child) =>
      transformLayoutTemplate(child, layout as unknown as Layout<Layout>)
    );
  } else {
    throw "Unexpected State: Layout children cannot be a mix of Tabs and Layouts.";
  }

  return layout;
};

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

export const getRoot = (layout: Layout<Tab | Layout>): Layout<Tab | Layout> => {
  return layout.parent ? getRoot(layout.parent) : layout;
};

export const useToggleTab = (id: string, layout: Layout): void => {
  if (getType(layout.children) === UIType.Layout) {
    throw "Unexpected Function Call (useToggleTab): cannot toggle tabs in a Layout of layouts.";
  }

  const tab = findTab(id, layout);

  if (!tab) {
    throw `Tab not found (useToggleTab): Unable to find tab with id "${id}".`;
  }

  if (layout.active !== id) {
    layout.active = id;
  }
};

export const getParentsHierarchy = (ui: Layout<any> | Tab): Array<string> => {
  const list = [];

  if (ui.parent) {
    list.push(ui.parent.id, ...getParentsHierarchy(ui.parent as Layout));
  }

  return list;
};

export const findUiByPath = (
  id: string,
  path: Array<string>,
  root: Layout<Layout>
): Tab | Layout => {
  let $path = path;
  let parent: Layout<Layout> = root;

  while ($path.length > 0) {
    const $parent = parent.children.find((child) => child.id === $path[0]);

    if (!$parent) {
      throw `Incorrect UI path (findUiByPath): "${path.join("/")}"`;
    }

    parent = $parent as unknown as Layout<Layout>;

    $path = $path.slice(1);
  }

  const $item = parent.children.find((child) => child.id === id);

  if (!$item) {
    throw `Not Found (findUiByPath): Unable to find UI element with id "${id}".`;
  }

  return $item;
};

export const useCloseTab = (id: string, layout: Layout): void => {
  if (getType(layout.children) === UIType.Layout) {
    throw "Unexpected Function Call (useCloseTab): cannot close tabs in a Layout of layouts.";
  }

  if (!findTab(id, layout)) {
    throw `Unexpected State (useCloseTab: Tab with id "${id}" does not exist.`;
  }

  const newChildren = layout.children.filter((item) => item.id !== id);

  layout.children = newChildren;

  if (newChildren.length === 0) {
    if (layout.parent) {
      const newParentChildren = layout.parent.children.filter(
        (child) => child.id !== layout.id
      ) as unknown as Array<Layout>;

      if (newParentChildren.length === 1) {
        const tabs = newParentChildren[0].children;

        layout.parent.children = tabs.map((tab) =>
          transformTabTemplate(
            createTab({ title: tab.title, data: tab.data, id: tab.id }),
            layout.parent as unknown as Layout
          )
        ) as unknown as Array<Layout>;

        layout.parent.direction = Direction.Row;
        layout.parent.active = newParentChildren[0].active;
      } else {
        layout.parent.children = newParentChildren as unknown as Array<Layout>;
      }
    }
  } else {
    if (layout.active === id) {
      layout.active = layout.children[0].id;
    }
  }
};

export const calculateSide = (e: DragEvent): Side => {
  const target = e.currentTarget as HTMLElement;

  const rect = target.getBoundingClientRect();

  const ratio = 0.15;

  const width = rect.width;
  const height = rect.height;

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (isInInterval(0, x, width * ratio)) {
    return Side.Left;
  } else if (isInInterval(width * (1 - ratio), x, width)) {
    return Side.Right;
  } else if (isInInterval(0, y, height * ratio)) {
    return Side.Top;
  } else if (isInInterval(height * (1 - ratio), y, height)) {
    return Side.Bottom;
  }

  return Side.Center;
};

export const useAddTab = (tab: TabTemplate, layout: Layout, position = Infinity) => {
  if (getType(layout.children) === UIType.Layout) {
    throw `Unexpected State: cannot add Tab to Layouts.`;
  }

  if (tab.id && findTab(tab.id, layout)) {
    return;
  } else {
    const $tab = transformTabTemplate(tab, layout);

    const pos = clamp(0, position, layout.children.length);

    layout.children = [...layout.children.slice(0, pos), $tab, ...layout.children.slice(pos)];
  }
};

export const useOnDrop = (tab: TabTemplate, layout: Layout, side: Side) => {
  switch (side) {
    case Side.Center: {
      useAddTab(tab, layout);
      break;
    }
    case Side.Top: {
      const top = createLayout({ children: [tab] });
      const bottom = createLayout({
        children: layout.children,
        direction: layout.direction,
      });

      layout.direction = Direction.Column;
      layout.children = [top, bottom].map((item) => {
        return transformLayoutTemplate(item, layout as unknown as Layout<Layout>);
      }) as unknown as Array<Tab>;
      layout.active = undefined;

      break;
    }
  }
};

export default (layout: LayoutTemplate) => {
  const tree = reactive(transformLayoutTemplate(layout));

  const actions: LayoutActions = {
    useToggleTab,
    useCloseTab,
    useAddTab,
    useOnDrop,
  };

  return { tree, actions };
};
