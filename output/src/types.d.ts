import { Root } from "postcss";
export declare type ExtractCallback = (root: Root) => void;
import * as parser from "postcss-selector-parser";
export declare type ExtractObj = {
    [key in string]: string;
};
export declare enum SelectorType {
    ClassName = "className",
    Attribute = "attribute",
    Id = "id",
    Tag = "tag"
}
export declare enum MergeMode {
    Merge = "merge",
    Before = "before"
}
export declare type SelectorNode = {
    type: keyof parser.NodeTypes;
    match: RegExp;
    key?: string;
};
export interface PluginOptions {
    extract?: ExtractCallback;
    includeResultInOutput?: boolean;
    mergeMode: MergeMode;
    mergeType: SelectorType;
    mergeValue: string;
    removeFromSelector: Array<SelectorNode>;
}
