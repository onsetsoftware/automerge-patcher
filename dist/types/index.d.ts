import { Prop } from "@automerge/automerge";
export { unpatch } from "./unpatch";
export { patch } from "./patch";
export declare type TempIncPatch = {
    action: 'inc';
    path: Prop[];
    value: number;
};
