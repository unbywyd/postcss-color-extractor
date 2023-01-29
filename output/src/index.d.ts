/**
 * @type {import('postcss').PluginCreator}
 */
import { PluginCreator } from "postcss";
import { PluginOptions } from "./types";
declare namespace plugin {
    type options = PluginOptions;
}
declare const plugin: PluginCreator<plugin.options>;
export = plugin;
