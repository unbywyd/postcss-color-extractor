import { Root } from "postcss";

export type ExtractCallback = (root: Root) => void;
import * as parser from "postcss-selector-parser";

export type ExtractObj = {
  [key in string]: string;
};

export enum SelectorType {
  ClassName = "className",
  Attribute = "attribute",
  Id = "id",
  Tag = "tag",
}

export enum MergeMode {
  Merge = "merge",
  Before = "before",
}

export type SelectorNode = {
  type: keyof parser.NodeTypes;
  match: RegExp;
  key?: string;
};
export interface PluginOptions {
  extract?: ExtractCallback;
  beforeCallback?: (root: Root) => void;
  includeResultInOutput?: boolean;
  mergeMode: MergeMode;
  mergeType: SelectorType;
  mergeValue: string|null;
  saveInputRules?: boolean;
  removeFromSelector: Array<SelectorNode>;
}
