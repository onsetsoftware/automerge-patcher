import { Patch } from "@automerge/automerge";
import { TempIncPatch } from "./index";
export declare const unpatch: <T extends Record<string, any>>(doc: T, patch: Patch | TempIncPatch) => Patch | TempIncPatch;
