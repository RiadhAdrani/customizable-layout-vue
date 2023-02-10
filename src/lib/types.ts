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
  onDrop: (
    data: Record<string, unknown>,
    layoutId: string,
    side: Side,
    isSame?: (t1: any, t2: any) => boolean
  ) => void;
  onEmptyDrop: (data: Record<string, unknown>) => void;
}

export type DraggedSignature = "__dragged__tab__";

export interface DraggedTab extends Omit<TabTemplate<Record<string, unknown>>, "title"> {
  id: string;
  signature: DraggedSignature;
}

export interface UseLayoutOptions<T> {
  onUnknownDropped: (data: Record<string, unknown>) => TabTemplate | undefined;
  areSameTab?: (tab1Data: T, tab2Data: T) => boolean;
  colors?: LayoutColorOptions;
}

export interface LayoutColorOptions {
  contentOverlay?: string;
  contentSide?: string;
}

export const defaultColors: LayoutColorOptions = {
  contentOverlay: "#0000ff11",
  contentSide: "#000000aa",
};

export interface UseLayoutOutput {
  tree: Layout<Layout | Tab>;
  actions: LayoutActions;
  colors: LayoutColorOptions;
}
