export enum Direction {
  Row = "row",
  Column = "column",
}

export enum Side {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
  Center = "center",
}

export enum UIType {
  Tab = "__tab__",
  Layout = "__layout__",
}

export interface BaseUI {
  id: string;
}

export interface TabTemplate<T = Record<string, unknown>> {
  type: UIType.Tab;
  title: string;
  data?: T;
}

export interface LayoutTemplate {
  type: UIType.Layout;
  children: Array<TabTemplate> | Array<LayoutTemplate>;
  direction?: Direction;
}

export type CreateLayoutTemplate = Omit<LayoutTemplate, "type">;
export type CreateTabTemplate = Omit<TabTemplate, "type">;

export interface Tab extends TabTemplate {
  id: string;
  parent: Layout;
}

export interface Layout<T = Tab> extends BaseUI {
  type: UIType.Layout;
  parent?: Layout<Layout>;
  children: Array<T>;
  direction: Direction;
  active?: string;
}

export interface LayoutActions {
  useToggleTab: (id: string, layout: Layout) => void;
  useCloseTab: (id: string, layout: Layout) => void;
  useAddTab: (tab: TabTemplate, layout: Layout, position?: number) => void;
  useOnDrop: (tab: TabTemplate, layout: Layout, side: Side) => void;
}

export interface LayoutEvents {
  onTabButtonClicked: (id: string, parent: string) => void;
}

export interface DraggedTab extends TabTemplate<Record<string, unknown>> {
  id: string;
  signature: "__dragged__tab__";
}
