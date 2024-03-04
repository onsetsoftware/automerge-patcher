import { Counter, Text } from "@automerge/automerge";

export const documentData: {
  string: string;
  text: Text;
  counter: Counter;
  array: string[];
  date: Date;
  optional?: number;
  object: {
    hello: string;
    data?: string;
    empty?: string;
  };
  emptyText: Text;
  emptyString: string;
  people: {
    ids: string[];
    entities: {
      [id: string]: {
        name: string;
        id: string;
      };
    };
  };
  deeply: {
    nested: {
      date: Date;
      object: {
        with: {
          a: {
            long: {
              path: string[];
            };
          };
        };
      };
    };
  };
  bytes: Uint8Array;
} = {
  string: "hello world",
  text: new Text("hello world"),
  counter: new Counter(0),
  array: ["hello", "world"],
  date: new Date(1692724609057),
  object: {
    hello: "world",
    empty: "",
  },
  optional: 1,
  emptyText: "" as unknown as Text, // this is the state which is created
  // when a text is created with an empty string patch
  emptyString: "",
  people: {
    ids: ["id-1", "id-2"],
    entities: {
      "id-1": {
        id: "id-1",
        name: "Alex",
      },
      "id-2": {
        id: "id-2",
        name: "John",
      },
    },
  },
  deeply: {
    nested: {
      date: new Date(1692724609057),
      object: {
        with: {
          a: {
            long: {
              path: ["hello", "world"],
            },
          },
        },
      },
    },
  },
  bytes: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
};

const { text, ...withoutText } = documentData;

export const documentDataWithoutText = withoutText;
