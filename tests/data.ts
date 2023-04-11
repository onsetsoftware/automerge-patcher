import { Counter, Text } from "@automerge/automerge";

export const documentData: {
  string: string;
  text: Text;
  counter: Counter;
  array: string[];
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
} = {
  string: "hello world",
  text: new Text("hello world"),
  counter: new Counter(0),
  array: ["hello", "world"],
  object: {
    hello: "world",
    empty: "",
  },
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
};
