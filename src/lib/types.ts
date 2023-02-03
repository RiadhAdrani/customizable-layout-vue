export enum Direction {
  Row = "row",
  Column = "column",
}

export enum Side {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
}

export enum UIType {
  Tab = "__tab__",
  Layout = "__layout__",
}

export interface CommonHooks {
  onMounted?: (el: BaseUI) => void;
  onBeforeUnmounted?: (el: BaseUI) => void;
  onUnmounted?: (el: BaseUI) => void;
}

export interface BaseUI extends CommonHooks {
  id: string;
}

export interface TabTemplate<T = Record<string, string>> {
  type: UIType.Tab;
  title: string;
  id?: string;
  data?: T;
}

export interface LayoutTemplate {
  id?: string;
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
  parent?: Layout;
  children: Array<T>;
  direction: Direction;
  active?: string;
}

export type onChildRemoved = (id: string, parent: string) => void;
export type onChildAdded = (id: string, parent: string, position?: number) => void;
export type onTabToggled = (id: string, parent: string) => void;
export type onDrop = <T = unknown>(data: T) => Tab;

export interface LayoutActions {
  useToggleTab: (id: string, layout: Layout) => void;
  useCloseTab: (id: string, layout: Layout) => void;
}

export interface LayoutEvents {
  onTabButtonClicked: (id: string, parent: string) => void;
}
