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
  DraggedTab,
  UseLayoutOptions,
  UseLayoutOutput,
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
  return { ...params, parent, id: useId() };
};

export const transformLayoutTemplate = (
  template: LayoutTemplate,
  parent?: Layout<Layout>
): Layout => {
  const layout: Layout = {
    ...template,
    children: [],
    parent,
    id: useId(),
    direction: template.direction ?? Direction.Row,
  };

  if (template.children.length === 0) {
    throw "Unexpected State (transformLayoutTemplate): Layout children should have at least 1 tab, or 2 layouts.";
  }

  if ((template.children as Array<TabTemplate>).every((child) => child.type === UIType.Tab)) {
    const children = template.children as Array<TabTemplate>;

    layout.children = children.map((child) => transformTabTemplate(child, layout));

    const ids = new Set(layout.children.map((item) => item.id));

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

export const findLayout = <T = Tab>(id: string, root: Layout<Layout>): Layout<T> | undefined => {
  const type = getType(root.children);

  if (type === UIType.Tab) {
    return undefined;
  } else if (type === UIType.Layout) {
    const maybe = root.children.find((child) => child.id === id);

    if (maybe) {
      return maybe as Layout<T>;
    }

    for (let child of root.children) {
      const maybe = findLayout(id, child as unknown as Layout<Layout>);

      if (maybe) {
        return maybe as Layout<T>;
      }
    }
  }
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
        layout.parent.children = newParentChildren[0].children as unknown as Array<Layout>;
        layout.parent.children.forEach((item) => (item.parent = layout.parent));
        layout.parent.direction = Direction.Row;

        // TODO : get correct active one
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

  const $tab = transformTabTemplate(tab, layout);

  const pos = clamp(0, position, layout.children.length);

  layout.children = [...layout.children.slice(0, pos), $tab, ...layout.children.slice(pos)];
};

export const useOnDrop = (
  data: Record<string, unknown> | DraggedTab,
  layout: Layout,
  side: Side,
  factory: (data: Record<string, unknown>) => TabTemplate | undefined
) => {
  let tab: TabTemplate | undefined = undefined;
  let dragged: boolean = false;

  const addAtSide = (direction: Direction, before: boolean) => {
    if (!tab) {
      throw "Invalid Value: Tab is undefined.";
    }

    if (layout.parent && layout.parent.direction === direction) {
      const newLayout = transformLayoutTemplate(
        createLayout({ children: [tab] }),
        layout.parent as unknown as Layout<Layout>
      );

      const index = layout.parent.children.indexOf(layout) + (before ? 0 : 1);

      layout.parent.children = [
        ...layout.parent.children.slice(0, index),
        newLayout,
        ...layout.parent.children.slice(index),
      ];
    } else if (!layout.parent || (layout.parent && layout.parent.direction !== direction)) {
      const oldLayout = { ...layout };

      oldLayout.parent = layout as unknown as Layout<Layout>;
      oldLayout.children.forEach((child) => (child.parent = oldLayout));

      const newLayout = transformLayoutTemplate(
        createLayout({ children: [tab] }),
        layout as unknown as Layout<Layout>
      );

      const $children = [newLayout, oldLayout] as unknown as Array<Tab>;

      layout.active = undefined;
      layout.direction = direction;
      layout.children = before ? $children : $children.reverse();
    } else {
      throw "Unhandled condition (useOnDrop)";
    }
  };

  if (
    data.type === UIType.Tab &&
    data.signature === "__dragged__tab__" &&
    typeof data.id === "string"
  ) {
    const $data = data as unknown as DraggedTab;

    const $exist = findTab(data.id, layout);

    if ($exist && layout.children.length === 1) {
      return;
    }

    const $tab = findTab($data.id, getRoot(layout));

    if (!$tab) {
      throw `Unexpected State (useOnDrop): dragged tab with id "${$data.id}" does not exist.`;
    }

    dragged = true;

    tab = createTab({ title: $tab.title, data: $tab.data });
  } else {
    tab ??= factory(data as Record<string, unknown>);
  }

  if (tab) {
    switch (side) {
      case Side.Center: {
        useAddTab(tab, layout);
        break;
      }
      case Side.Top: {
        addAtSide(Direction.Column, true);
        break;
      }
      case Side.Bottom: {
        addAtSide(Direction.Column, false);
        break;
      }
      case Side.Left: {
        addAtSide(Direction.Row, true);
        break;
      }
      case Side.Right: {
        addAtSide(Direction.Row, false);
        break;
      }
    }
  }

  if (dragged) {
    const tab = findTab((data as DraggedTab).id, getRoot(layout)) as Tab;

    useCloseTab(tab.id, tab.parent);
  }
};

export default (layout: LayoutTemplate, options: UseLayoutOptions): UseLayoutOutput => {
  const tree = reactive(transformLayoutTemplate(layout));

  const actions: LayoutActions = {
    addTab(tab, id, position) {
      const layout = findLayout(id, tree as unknown as Layout<Layout>);

      if (!layout) {
        throw `Not found: Layout with id "${id}" was not found.`;
      }

      useAddTab(tab, layout, position);
    },
    closeTab(id) {
      const tab = findTab(id, tree);

      if (!tab) {
        throw `Not found: Tab with id "${id}" was not found.`;
      }

      useCloseTab(id, tab.parent);
    },
    toggleTab(id) {
      const tab = findTab(id, tree);

      if (!tab) {
        throw `Not found: Tab with id "${id}" was not found.`;
      }

      useToggleTab(id, tab.parent);
    },
    onDrop(data, id, side) {
      const layout = findLayout(id, tree as unknown as Layout<Layout>);

      if (!layout) {
        throw `Not found: Layout with id "${id}" was not found.`;
      }

      useOnDrop(data, layout, side, options.onUnknownDropped);
    },
  };

  return { tree, actions };
};
