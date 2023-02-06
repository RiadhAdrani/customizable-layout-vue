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
      expect(createTab({ title: "Test", data: { id: "123" }, id: "1" })).toStrictEqual({
        title: "Test",
        type: UIType.Tab,
        data: { id: "123" },
        id: "1",
      });
    });
  });

  describe("createLayout", () => {
    it("should create a layout template with minimal options", () => {
      expect(createLayout({ children: [] })).toStrictEqual({ children: [], type: UIType.Layout });
    });

    it("should create a layout template with minimal options", () => {
      expect(createLayout({ children: [], direction: Direction.Column, id: "1" })).toStrictEqual({
        children: [],
        direction: Direction.Column,
        id: "1",
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

    it("should throw when there is a duplicate id", () => {
      const template = createLayout({
        children: [createTab({ title: "1", id: "1" }), createTab({ title: "1", id: "1" })],
      });

      expect(() => transformLayoutTemplate(template)).toThrow(`Duplicate Id: Duplicate id found.`);
    });

    it("should create a Layout of Tabs", () => {
      const template = createLayout({
        children: [createTab({ title: "Test", id: "1" }), createTab({ title: "Test 2", id: "2" })],
      });

      const layout = transformLayoutTemplate(template);

      expect(layout.id).toBeDefined();
      expect(layout.parent).toBeUndefined();
      expect(layout.children.length).toBe(2);
      expect(layout.active).toBe("1");
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
          createTab({ title: "Hello 1", id: "1", data: { n: 1 } }),
          createTab({ title: "Hello 2", id: "2", data: { n: 2 } }),
          createTab({ title: "Hello 3", id: "3", data: { n: 3 } }),
        ],
      })
    );

    it("should find tab with given id", () => {
      const tab = getTab("2", layout.children) as Tab;

      expect(tab.data).toStrictEqual({ n: 2 });
      expect(tab.id).toStrictEqual("2");
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
              createTab({ title: "Hello 1", id: "1", data: { n: 1 } }),
              createTab({ title: "Hello 2", id: "2", data: { n: 2 } }),
              createTab({ title: "Hello 3", id: "3", data: { n: 3 } }),
            ],
          }),
          createLayout({
            children: [
              createLayout({
                children: [
                  createTab({ title: "Hello 7", id: "7", data: { n: 7 } }),
                  createTab({ title: "Hello 8", id: "8", data: { n: 8 } }),
                  createTab({ title: "Hello 9", id: "9", data: { n: 9 } }),
                ],
              }),
              createLayout({
                children: [
                  createTab({ title: "Hello 10", id: "10", data: { n: 10 } }),
                  createTab({ title: "Hello 11", id: "11", data: { n: 11 } }),
                  createTab({ title: "Hello 12", id: "12", data: { n: 12 } }),
                ],
              }),
            ],
          }),
          createLayout({
            children: [
              createTab({ title: "Hello 4", id: "4", data: { n: 4 } }),
              createTab({ title: "Hello 5", id: "5", data: { n: 5 } }),
              createTab({ title: "Hello 6", id: "6", data: { n: 6 } }),
            ],
          }),
        ],
      })
    );

    it("should find tab in nested layouts", () => {
      const tab = findTab("8", layout) as Tab;

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
              createTab({ title: "Hello 1", id: "1", data: { n: 1 } }),
              createTab({ title: "Hello 2", id: "2", data: { n: 2 } }),
              createTab({ title: "Hello 3", id: "3", data: { n: 3 } }),
            ],
          }),
          createLayout({
            children: [
              createLayout({
                children: [
                  createTab({ title: "Hello 7", id: "7", data: { n: 7 } }),
                  createTab({ title: "Hello 8", id: "8", data: { n: 8 } }),
                  createTab({ title: "Hello 9", id: "9", data: { n: 9 } }),
                ],
              }),
              createLayout({
                children: [
                  createTab({ title: "Hello 10", id: "10", data: { n: 10 } }),
                  createTab({ title: "Hello 11", id: "11", data: { n: 11 } }),
                  createTab({ title: "Hello 12", id: "12", data: { n: 12 } }),
                ],
              }),
            ],
          }),
          createLayout({
            children: [
              createTab({ title: "Hello 4", id: "4", data: { n: 4 } }),
              createTab({ title: "Hello 5", id: "5", data: { n: 5 } }),
              createTab({ title: "Hello 6", id: "6", data: { n: 6 } }),
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
        id: "1",
        children: [
          createLayout({
            id: "1-1",
            children: [
              createTab({ id: "1", title: "" }),
              createTab({ id: "2", title: "" }),
              createTab({ id: "3", title: "" }),
            ],
          }),
          createLayout({
            id: "1-2",
            children: [
              createLayout({
                id: "1-2-1",
                children: [
                  createTab({ id: "1", title: "" }),
                  createTab({ id: "2", title: "" }),
                  createTab({ id: "3", title: "" }),
                ],
              }),
              createLayout({
                id: "1-2-2",
                children: [
                  createTab({ id: "3", title: "" }),
                  createTab({ id: "4", title: "" }),
                  createTab({ id: "5", title: "" }),
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
      expect(getParentsHierarchy(layout.children[0])).toStrictEqual(["1"]);
    });

    it("should return an array of second level", () => {
      expect(getParentsHierarchy(layout.children[0].children[0])).toStrictEqual(["1-1", "1"]);
    });

    it("should return an array of third level", () => {
      expect(
        getParentsHierarchy((layout.children[1].children[1] as unknown as Layout).children[1])
      ).toStrictEqual(["1-2-2", "1-2", "1"]);
    });
  });

  describe("findUiByHierarchy", () => {
    const layout = transformLayoutTemplate(
      createLayout({
        id: "1",
        children: [
          createLayout({
            id: "1-1",
            children: [
              createTab({ id: "1", title: "" }),
              createTab({ id: "2", title: "" }),
              createTab({ id: "3", title: "" }),
            ],
          }),
          createLayout({
            id: "1-2",
            children: [
              createLayout({
                id: "1-2-1",
                children: [
                  createTab({ id: "1", title: "" }),
                  createTab({ id: "2", title: "" }),
                  createTab({ id: "3", title: "" }),
                ],
              }),
              createLayout({
                id: "1-2-2",
                children: [
                  createTab({ id: "3", title: "" }),
                  createTab({ id: "4", title: "me" }),
                  createTab({ id: "5", title: "" }),
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

    it("should throw when id is not found", () => {
      expect(() => findUiByPath("5", ["1-1"], layout)).toThrow(
        `Not Found (findUiByPath): Unable to find UI element with id "5".`
      );
    });

    it("should retrieve element", () => {
      const el = findUiByPath("4", ["1-2", "1-2-2"], layout) as Tab;

      expect(el).toBeDefined();
      expect(el.id).toBe("4");
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
              children: [createTab({ title: "Hello 1", id: "1", data: { n: 1 } })],
            }),
            createLayout({
              children: [createTab({ title: "Hello 2", id: "2", data: { n: 4 } })],
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
          children: [createTab({ title: "1", id: "1" }), createTab({ title: "2", id: "2" })],
        })
      );

      expect(() => useToggleTab("3", layout)).toThrow(
        'Tab not found (useToggleTab): Unable to find tab with id "3".'
      );
    });

    it("should toggle tab", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [createTab({ title: "1", id: "1" }), createTab({ title: "2", id: "2" })],
        })
      );

      expect(layout.active).toBe("1");

      useToggleTab("2", layout);

      expect(layout.active).toBe("2");
    });
  });

  describe("useCloseTab", () => {
    it("should throw when layout is Layout<Layout>", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({
              children: [createTab({ title: "Hello 1", id: "1", data: { n: 1 } })],
            }),
            createLayout({
              children: [createTab({ title: "Hello 2", id: "2", data: { n: 4 } })],
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
          children: [createTab({ title: "1", id: "1" }), createTab({ title: "2", id: "2" })],
        })
      );

      expect(() => useCloseTab("3", layout)).toThrow(
        `Unexpected State (useCloseTab: Tab with id "3" does not exist.`
      );
    });

    it("should throw when tab is not found", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [createTab({ title: "1", id: "1" }), createTab({ title: "2", id: "2" })],
        })
      );

      useCloseTab("1", layout);

      expect(layout.active).toBe("2");
      expect(layout.children.length).toBe(1);
      expect(layout.children[0].id).toBe("2");
    });

    it("should remove layout if it have no tabs, and have a parent", () => {
      const parent = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({ children: [createTab({ title: "1", id: "1" })] }),
            createLayout({
              children: [createTab({ title: "2", id: "2" }), createTab({ title: "3", id: "3" })],
            }),
            createLayout({ children: [createTab({ title: "4", id: "4" })] }),
          ],
        })
      ) as unknown as Layout<Layout>;

      const layout = parent.children[0];

      useCloseTab("1", layout);

      expect(parent.children.length).toBe(2);

      expect(parent.children[0].children.length).toBe(2);
      expect(parent.children[0].children[0].id).toBe("2");
      expect(parent.children[0].children[1].id).toBe("3");

      expect(parent.children[1].children.length).toBe(1);
      expect(parent.children[1].children[0].id).toBe("4");
    });

    it("should transform parent to Layout<Tab> if the number of layouts after removing the layout === 1", () => {
      const parent = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({ children: [createTab({ title: "1", id: "1" })] }),
            createLayout({
              children: [
                createTab({ title: "2", id: "2" }),
                createTab({ title: "3", id: "3" }),
                createTab({ title: "4", id: "4" }),
              ],
            }),
          ],
          direction: Direction.Column,
        })
      ) as unknown as Layout<Layout>;

      const layout = parent.children[0];

      useCloseTab("1", layout);

      expect(parent.children.length).toBe(3);
      expect(parent.children[0].id).toBe("2");
      expect(parent.children[1].id).toBe("3");
      expect(parent.children[2].id).toBe("4");
      expect(parent.direction).toBe(Direction.Row);
    });
  });

  describe("useAddTab", () => {
    it("should throw when layout is Layout<Layout>", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createLayout({
              children: [createTab({ title: "Hello 1", id: "1", data: { n: 1 } })],
            }),
            createLayout({
              children: [createTab({ title: "Hello 2", id: "2", data: { n: 4 } })],
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
        createLayout({ children: [createTab({ title: "1", id: "1" })] })
      );

      useAddTab(createTab({ title: "2", id: "2" }), layout);

      expect(layout.children.length).toBe(2);
      expect(layout.children[0].id).toBe("1");
      expect(layout.children[1].id).toBe("2");
    });

    it("should add tab at given position", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createTab({ title: "1", id: "1" }),
            createTab({ title: "2", id: "2" }),
            createTab({ title: "3", id: "3" }),
          ],
        })
      );

      useAddTab(createTab({ title: "5", id: "5" }), layout, 1);

      expect(layout.children.length).toBe(4);
      expect(layout.children[0].id).toBe("1");
      expect(layout.children[1].id).toBe("5");
      expect(layout.children[2].id).toBe("2");
      expect(layout.children[3].id).toBe("3");
    });

    it("should add tab", () => {
      const layout = transformLayoutTemplate(
        createLayout({ children: [createTab({ title: "1", id: "1" })] })
      );

      useAddTab(createTab({ title: "2", id: "2" }), layout);

      expect(layout.children.length).toBe(2);
      expect(layout.children[0].id).toBe("1");
      expect(layout.children[1].id).toBe("2");
    });

    it("should not add tab with an existing id", () => {
      const layout = transformLayoutTemplate(
        createLayout({
          children: [
            createTab({ title: "1", id: "1" }),
            createTab({ title: "2", id: "2" }),
            createTab({ title: "3", id: "3" }),
          ],
        })
      );

      useAddTab(createTab({ title: "1", id: "1" }), layout);

      expect(layout.children.length).toBe(3);
      expect(layout.children[0].id).toBe("1");
      expect(layout.children[1].id).toBe("2");
      expect(layout.children[2].id).toBe("3");
    });
  });
});
