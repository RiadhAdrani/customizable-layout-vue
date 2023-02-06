import { it, describe, expect } from "vitest";
import { Direction, Layout, Tab, UIType } from "../types";
import {
  createTab,
  createLayout,
  getType,
  transformTabTemplate,
  transformLayoutTemplate,
  findTab,
  getTab,
  getRoot,
  useToggleTab,
  useCloseTab,
  useAddTab,
  getParentsHierarchy,
  findUiByPath,
} from "../useLayout";

describe("useLayout", () => {
  describe("createTab", () => {
    it("should create a tab template with minimal options", () => {
      expect(createTab({ title: "Test" })).toStrictEqual({ title: "Test", type: UIType.Tab });
    });

    it("should create a tab template with all options", () => {
      expect(createTab({ title: "Test", data: { id: "123" } })).toStrictEqual({
        title: "Test",
        type: UIType.Tab,
        data: { id: "123" },
      });
    });
  });

  describe("createLayout", () => {
    it("should create a layout template with minimal options", () => {
      expect(createLayout({ children: [] })).toStrictEqual({ children: [], type: UIType.Layout });
    });

    it("should create a layout template with minimal options", () => {
      expect(createLayout({ children: [], direction: Direction.Column })).toStrictEqual({
        children: [],
        direction: Direction.Column,
        type: UIType.Layout,
      });
    });
  });

  describe("transformTabTemplate", () => {
    it("should transform tab template to a tab object", () => {
      const parent: Layout = {
        children: [],
        direction: Direction.Row,
        id: "1",
        type: UIType.Layout,
      };

      const tab = transformTabTemplate({ title: "Test", type: UIType.Tab }, parent);

      expect(tab.parent === parent).toBe(true);
      expect(tab.title).toBe("Test");
      expect(tab.id).toBeDefined();
      expect(typeof tab.id === "string").toBe(true);
    });
  });

  describe("transformLayoutTemplate", () => {
    it("should throw when children array is empty", () => {
      const template = createLayout({ children: [] });

      expect(() => transformLayoutTemplate(template)).toThrow(
        "Unexpected State (transformLayoutTemplate): Layout children should have at least 1 tab, or 2 layouts."
      );
    });

    it("should create a Layout of Tabs", () => {
      const template = createLayout({
        children: [createTab({ title: "Test" }), createTab({ title: "Test 2" })],
      });

      const layout = transformLayoutTemplate(template);

      expect(layout.id).toBeDefined();
      expect(layout.parent).toBeUndefined();
      expect(layout.children.length).toBe(2);
      expect(layout.active).toBe(layout.children[0].id);
      expect(layout.children.every((child) => child.type === UIType.Tab)).toBe(true);
    });

    it("should create a Layout of Layouts", () => {
      const template = createLayout({
        children: [
          createLayout({ children: [createTab({ title: "test" })] }),
          createLayout({
            children: [
              createTab({ title: "test" }),
              createTab({ title: "test" }),
              createTab({ title: "test" }),
            ],
          }),
          createLayout({ children: [createTab({ title: "test" }), createTab({ title: "test" })] }),
        ],
      });

      const layout = transformLayoutTemplate(template) as unknown as Layout<Layout>;

      expect(layout.id).toBeDefined();
      expect(layout.parent).toBeUndefined();
      expect(layout.children.length).toBe(3);

      expect(layout.children[0].parent === layout).toBe(true);
      expect(layout.children[0].children.length).toBe(1);
      expect(layout.children[0].children[0].parent).toBe(layout.children[0]);

      expect(layout.children[1].parent === layout).toBe(true);
      expect(layout.children[1].children.length).toBe(3);
      expect(layout.children[1].children[0].parent).toBe(layout.children[1]);
      expect(layout.children[1].children[1].parent).toBe(layout.children[1]);
      expect(layout.children[1].children[2].parent).toBe(layout.children[1]);

      expect(layout.children[2].parent === layout).toBe(true);
      expect(layout.children[2].children.length).toBe(2);
      expect(layout.children[2].children[0].parent).toBe(layout.children[2]);
      expect(layout.children[2].children[1].parent).toBe(layout.children[2]);

      expect(layout.active).toBeUndefined();
      expect(layout.children.every((child) => child.type === UIType.Layout)).toBe(true);
    });

    it("should throw if the number of layouts is less than 2", () => {
      const template = createLayout({
        children: [createLayout({ children: [createTab({ title: "test" })] })],
      });

      expect(() => transformLayoutTemplate(template)).toThrow(
        "Invalid Parameters (transformLayoutTemplate): Layout children should be 2 or more."
      );
    });

    it("should throw if children is a mix of tabs and layouts", () => {
      const template = createLayout({
        children: [
          createLayout({ children: [createTab({ title: "test" })] }),
          createTab({ title: "Hello" }),
        ] as Array<Tab>,
      });

      expect(() => transformLayoutTemplate(template)).toThrow(
        "Unexpected State: Layout children cannot be a mix of Tabs and Layouts."
      );
    });
  });

  describe("getType", () => {
    it("should return type as Layout of Tab", () => {
      const layout = transformLayoutTemplate(
        createLayout({ children: [createTab({ title: "Hello" })] })
      );

      expect(getType(layout.children)).toBe(UIType.Tab);
    });

    it("should return type as Layout of Tab", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({
              children: [createTab({ title: "Hello" }), createTab({ title: "Hello" })],
            }),
            createLayout({
              children: [createTab({ title: "Hello" }), createTab({ title: "Hello" })],
            }),
          ],
        })
      );

      expect(getType(layout.children)).toBe(UIType.Layout);
    });

    it("should throw when an element is unknown", () => {
      const layout = transformLayoutTemplate(
        createLayout({ children: [createTab({ title: "Hello" })] })
      );

      const el = {};

      layout.children.push(el as Tab);

      expect(() => getType(layout.children)).toThrow(
        "Unexpected State (getType): Layout children cannot be a mix of Tabs and Layouts."
      );
    });

    it("should throw when array is a mix of tabs and layouts", () => {
      const layout = transformLayoutTemplate(
        createLayout({ children: [createTab({ title: "Hello" })] })
      );

      const el = transformLayoutTemplate(
        createLayout({ children: [createTab({ title: "Hello" })] }),
        layout as unknown as Layout<Layout>
      );

      layout.children.push(el as unknown as Tab);

      expect(() => getType(layout.children)).toThrow(
        "Unexpected State (getType): Layout children cannot be a mix of Tabs and Layouts."
      );
    });
  });

  describe("getTab", () => {
    const layout = transformLayoutTemplate(
      createLayout({
        children: [
          createTab({ title: "Hello 1", data: { n: 1 } }),
          createTab({ title: "Hello 2", data: { n: 2 } }),
          createTab({ title: "Hello 3", data: { n: 3 } }),
        ],
      })
    );

    it("should find tab with given id", () => {
      const id = layout.children[1].id;

      const tab = getTab(id, layout.children) as Tab;

      expect(tab.data).toStrictEqual({ n: 2 });
      expect(tab.title).toStrictEqual("Hello 2");
    });

    it("should throw when a tab is not found", () => {
      const call = () => getTab("5", layout.children);

      expect(call).toThrowError(`Unexpected State (getTab): Unable to get tab with id "5"`);
    });
  });

  describe("findTab", () => {
    const layout = transformLayoutTemplate(
      createLayout({
        children: [
          createLayout({
            children: [
              createTab({ title: "Hello 1", data: { n: 1 } }),
              createTab({ title: "Hello 2", data: { n: 2 } }),
              createTab({ title: "Hello 3", data: { n: 3 } }),
            ],
          }),
          createLayout({
            children: [
              createLayout({
                children: [
                  createTab({ title: "Hello 7", data: { n: 7 } }),
                  createTab({ title: "Hello 8", data: { n: 8 } }),
                  createTab({ title: "Hello 9", data: { n: 9 } }),
                ],
              }),
              createLayout({
                children: [
                  createTab({ title: "Hello 10", data: { n: 10 } }),
                  createTab({ title: "Hello 11", data: { n: 11 } }),
                  createTab({ title: "Hello 12", data: { n: 12 } }),
                ],
              }),
            ],
          }),
          createLayout({
            children: [
              createTab({ title: "Hello 4", data: { n: 4 } }),
              createTab({ title: "Hello 5", data: { n: 5 } }),
              createTab({ title: "Hello 6", data: { n: 6 } }),
            ],
          }),
        ],
      })
    );

    it("should find tab in nested layouts", () => {
      const id = (layout as unknown as Layout<Layout<Layout>>).children[1].children[0].children[1]
        .id;

      const tab = findTab(id, layout) as Tab;

      expect(tab).toBeDefined();
      expect(tab.data).toStrictEqual({ n: 8 });
      expect(tab.title).toBe("Hello 8");
    });

    it("should return undefined when tab not found", () => {
      const tab = findTab("55", layout) as Tab;

      expect(tab).toBe(undefined);
    });
  });

  describe("getRoot", () => {
    const layout = transformLayoutTemplate(
      createLayout({
        children: [
          createLayout({
            children: [
              createTab({ title: "Hello 1", data: { n: 1 } }),
              createTab({ title: "Hello 2", data: { n: 2 } }),
              createTab({ title: "Hello 3", data: { n: 3 } }),
            ],
          }),
          createLayout({
            children: [
              createLayout({
                children: [
                  createTab({ title: "Hello 7", data: { n: 7 } }),
                  createTab({ title: "Hello 8", data: { n: 8 } }),
                  createTab({ title: "Hello 9", data: { n: 9 } }),
                ],
              }),
              createLayout({
                children: [
                  createTab({ title: "Hello 10", data: { n: 10 } }),
                  createTab({ title: "Hello 11", data: { n: 11 } }),
                  createTab({ title: "Hello 12", data: { n: 12 } }),
                ],
              }),
            ],
          }),
          createLayout({
            children: [
              createTab({ title: "Hello 4", data: { n: 4 } }),
              createTab({ title: "Hello 5", data: { n: 5 } }),
              createTab({ title: "Hello 6", data: { n: 6 } }),
            ],
          }),
        ],
      })
    ) as unknown as Layout<Layout>;

    it("should return root parent of a direct child", () => {
      const child = layout.children[0];
      expect(getRoot(child) === (layout as unknown as Layout)).toBe(true);
    });

    it("should return root parent of a nested child", () => {
      const child = layout.children[0].children[2] as unknown as Layout;
      expect(getRoot(child) === (layout as unknown as Layout)).toBe(true);
    });
  });

  describe("getParentsHierarchy", () => {
    const layout = transformLayoutTemplate(
      createLayout({
        children: [
          createLayout({
            children: [
              createTab({ title: "" }),
              createTab({ title: "" }),
              createTab({ title: "" }),
            ],
          }),
          createLayout({
            children: [
              createLayout({
                children: [
                  createTab({ title: "" }),
                  createTab({ title: "" }),
                  createTab({ title: "" }),
                ],
              }),
              createLayout({
                children: [
                  createTab({ title: "" }),
                  createTab({ title: "" }),
                  createTab({ title: "" }),
                ],
              }),
            ],
          }),
        ],
      })
    ) as unknown as Layout<Layout>;

    it("should return an empty array in the root", () => {
      expect(getParentsHierarchy(layout)).toStrictEqual([]);
    });

    it("should return an array of one level", () => {
      const id = layout.id;

      expect(getParentsHierarchy(layout.children[0])).toStrictEqual([id]);
    });

    it("should return an array of second level", () => {
      const id = layout.id;
      const parentId = layout.children[0].id;

      expect(getParentsHierarchy(layout.children[0].children[0])).toStrictEqual([parentId, id]);
    });

    it("should return an array of third level", () => {
      const rootId = layout.id;
      const grandParentId = layout.children[1].id;
      const parentId = layout.children[1].children[1].id;

      expect(
        getParentsHierarchy((layout.children[1].children[1] as unknown as Layout).children[1])
      ).toStrictEqual([parentId, grandParentId, rootId]);
    });
  });

  describe("findUiByHierarchy", () => {
    const layout = transformLayoutTemplate(
      createLayout({
        children: [
          createLayout({
            children: [
              createTab({ title: "" }),
              createTab({ title: "" }),
              createTab({ title: "" }),
            ],
          }),
          createLayout({
            children: [
              createLayout({
                children: [
                  createTab({ title: "" }),
                  createTab({ title: "" }),
                  createTab({ title: "" }),
                ],
              }),
              createLayout({
                children: [
                  createTab({ title: "" }),
                  createTab({ title: "me" }),
                  createTab({ title: "" }),
                ],
              }),
            ],
          }),
        ],
      })
    ) as unknown as Layout<Layout>;

    it("should throw when hierarchy is wrong", () => {
      expect(() => findUiByPath("3", ["1-2", "1-2-3"], layout)).toThrow(
        `Incorrect UI path (findUiByPath): "1-2/1-2-3"`
      );
    });

    it("should retrieve element", () => {
      const grandParentId = layout.children[1].id;
      const parentId = layout.children[1].children[1].id;
      const tabId = (layout.children[1].children[1] as unknown as Layout).children[1].id;

      const el = findUiByPath(tabId, [grandParentId, parentId], layout) as Tab;

      expect(el).toBeDefined();
      expect(el.title).toBe("me");
      expect(el.type).toBe(UIType.Tab);
    });
  });

  describe("useToggleTab", () => {
    it("should throw when layout is Layout<Layout>", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({
              children: [createTab({ title: "Hello 1", data: { n: 1 } })],
            }),
            createLayout({
              children: [createTab({ title: "Hello 2", data: { n: 4 } })],
            }),
          ],
        })
      );

      expect(() => useToggleTab("2", layout)).toThrow(
        "Unexpected Function Call (useToggleTab): cannot toggle tabs in a Layout of layouts."
      );
    });

    it("should throw when tab is not found", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [createTab({ title: "1" }), createTab({ title: "2" })],
        })
      );

      expect(() => useToggleTab("3", layout)).toThrow(
        'Tab not found (useToggleTab): Unable to find tab with id "3".'
      );
    });

    it("should toggle tab", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [createTab({ title: "1" }), createTab({ title: "2" })],
        })
      );

      expect(layout.active).toBe(layout.children[0].id);

      useToggleTab(layout.children[1].id, layout);

      expect(layout.active).toBe(layout.children[1].id);
    });
  });

  describe("useCloseTab", () => {
    it("should throw when layout is Layout<Layout>", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({
              children: [createTab({ title: "Hello 1", data: { n: 1 } })],
            }),
            createLayout({
              children: [createTab({ title: "Hello 2", data: { n: 4 } })],
            }),
          ],
        })
      );

      expect(() => useCloseTab("2", layout)).toThrow(
        "Unexpected Function Call (useCloseTab): cannot close tabs in a Layout of layouts."
      );
    });

    it("should throw when tab is not found", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [createTab({ title: "1" }), createTab({ title: "2" })],
        })
      );

      expect(() => useCloseTab("3", layout)).toThrow(
        `Unexpected State (useCloseTab: Tab with id "3" does not exist.`
      );
    });

    it("should close and remove tab", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [createTab({ title: "1" }), createTab({ title: "2" })],
        })
      );

      const expectedId = layout.children[1].id;

      useCloseTab(layout.children[0].id, layout);

      expect(layout.active).toBe(expectedId);
      expect(layout.children.length).toBe(1);
    });

    it("should remove layout if it have no tabs, and have a parent", () => {
      const parent = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({ children: [createTab({ title: "1" })] }),
            createLayout({
              children: [createTab({ title: "2" }), createTab({ title: "3" })],
            }),
            createLayout({ children: [createTab({ title: "4" })] }),
          ],
        })
      ) as unknown as Layout<Layout>;

      const layout = parent.children[0];

      const layout2Ids = parent.children[1].children.map((child) => child.id);
      const layout3Ids = parent.children[2].children.map((child) => child.id);

      useCloseTab(layout.children[0].id, layout);

      expect(parent.children.length).toBe(2);

      expect(parent.children[0].children.length).toBe(2);
      expect(parent.children[0].children[0].id).toBe(layout2Ids[0]);
      expect(parent.children[0].children[1].id).toBe(layout2Ids[1]);

      expect(parent.children[1].children.length).toBe(1);
      expect(parent.children[1].children[0].id).toBe(layout3Ids[0]);
    });

    it("should transform parent to Layout<Tab> if the number of layouts after removing the layout === 1", () => {
      const parent = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({ children: [createTab({ title: "1" })] }),
            createLayout({
              children: [
                createTab({ title: "2", data: { id: 2 } }),
                createTab({ title: "3", data: { id: 3 } }),
                createTab({ title: "4", data: { id: 4 } }),
              ],
            }),
          ],
          direction: Direction.Column,
        })
      ) as unknown as Layout<Layout>;

      const layout = parent.children[0];

      useCloseTab(layout.children[0].id, layout);

      expect(parent.children.length).toBe(3);
      expect((parent.children[0] as unknown as Tab).title).toBe("2");
      expect((parent.children[0] as unknown as Tab).data).toStrictEqual({ id: 2 });
      expect((parent.children[1] as unknown as Tab).title).toBe("3");
      expect((parent.children[1] as unknown as Tab).data).toStrictEqual({ id: 3 });
      expect((parent.children[2] as unknown as Tab).title).toBe("4");
      expect((parent.children[2] as unknown as Tab).data).toStrictEqual({ id: 4 });
      expect(parent.direction).toBe(Direction.Row);
    });

    it.only("should transform parent to the only layout remaining", () => {
      const parent = transformLayoutTemplate(
        createLayout({
          direction: Direction.Column,
          children: [
            createLayout({
              children: [
                createLayout({ children: [createTab({ title: "1", data: { id: 1 } })] }),
                createLayout({ children: [createTab({ title: "2", data: { id: 2 } })] }),
              ],
            }),
            createLayout({ children: [createTab({ title: "3", data: { id: 3 } })] }),
          ],
        })
      ) as unknown as Layout<Layout>;

      const layout = parent.children[1];

      useCloseTab(layout.children[0].id, layout);

      expect(parent.direction).toBe(Direction.Row);
      expect(parent.children.length).toBe(2);
      expect(parent.children[0].children[0].title).toBe("1");
      expect(parent.children[0].children[0].data).toStrictEqual({ id: 1 });
      expect(parent.children[1].children[0].title).toBe("2");
      expect(parent.children[1].children[0].data).toStrictEqual({ id: 2 });
    });
  });

  describe("useAddTab", () => {
    it("should throw when layout is Layout<Layout>", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({
              children: [createTab({ title: "Hello 1", data: { n: 1 } })],
            }),
            createLayout({
              children: [createTab({ title: "Hello 2", data: { n: 4 } })],
            }),
          ],
        })
      );

      expect(() => useAddTab(createTab({ title: "Hello" }), layout)).toThrow(
        `Unexpected State: cannot add Tab to Layouts.`
      );
    });

    it("should add tab", () => {
      const layout = transformLayoutTemplate(
        createLayout({ children: [createTab({ title: "1" })] })
      );

      useAddTab(createTab({ title: "2", data: { id: 2 } }), layout);

      expect(layout.children.length).toBe(2);
      expect(layout.children[1].data).toStrictEqual({ id: 2 });
    });

    it("should add tab at given position", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createTab({ title: "1" }),
            createTab({ title: "2" }),
            createTab({ title: "3" }),
          ],
        })
      );

      useAddTab(createTab({ title: "5", data: { id: 5 } }), layout, 1);

      expect(layout.children.length).toBe(4);
      expect(layout.children[0].title).toBe("1");
      expect(layout.children[1].title).toBe("5");
      expect(layout.children[1].data).toStrictEqual({ id: 5 });
      expect(layout.children[2].title).toBe("2");
      expect(layout.children[3].title).toBe("3");
    });
  });
});