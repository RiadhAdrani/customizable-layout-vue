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
  toggleTab: (id: string) => void;
  closeTab: (id: string) => void;
  addTab: (tab: TabTemplate, LayoutId: string, position?: number) => void;
  onDrop: (data: Record<string, unknown>, layoutId: string, side: Side) => void;
}

export type DraggedSignature = "__dragged__tab__";

export interface DraggedTab extends Omit<TabTemplate<Record<string, unknown>>, "title"> {
  id: string;
  signature: DraggedSignature;
}

export interface UseLayoutOptions {
  onUnknownDropped: (data: Record<string, unknown>) => TabTemplate | undefined;
}

export interface UseLayoutOutput {
  tree: Layout<Layout | Tab>;
  actions: LayoutActions;
}
