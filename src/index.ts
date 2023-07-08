/**
 * @type {import('postcss').PluginCreator}
 */
import { PluginCreator } from "postcss";
import { name } from "../package.json";
import { MergeMode, PluginOptions, SelectorType } from "./types";
import { colorDetecor } from "./utils";

import * as parser from "postcss-selector-parser";

namespace plugin {
  export type options = PluginOptions;
}

const plugin: PluginCreator<plugin.options> = (opts) => {
  const options: PluginOptions = {
    removeFromSelector: [
      {
        type: "tag",
        match: /html/i,
      },
      {
        type: "pseudo",
        match: /:root/i,
      },
      {
        type: "attribute",
        match: /dir/i,
      },
    ],
    includeResultInOutput: false,
    mergeMode: MergeMode.Before,
    saveInputRules: false,
    mergeType: SelectorType.ClassName,
    mergeValue: "theme",
    ...(opts || {}),
  };

  // check options

  if (
    options.mergeValue &&
    !Object.values(SelectorType).includes(options.mergeType)
  ) {
    throw new Error(
      `mergeType must be one of ${Object.values(SelectorType).join(",")}`
    );
  }

  if (
    options.mergeValue &&
    !Object.values(MergeMode).includes(options.mergeMode)
  ) {
    throw new Error(
      `mergeMode must be one of ${Object.values(MergeMode).join(",")}`
    );
  }

  return {
    postcssPlugin: name,
    Once(root) {
      if (options.beforeCallback) {
        options.beforeCallback(root);
      }
      try {
        // clone root
        const rootClone = root.clone();

        /*
         *    Remove all color declarations if saveInputRules is false.
         */
        if (!options.saveInputRules) {
          root.walkDecls((node) => {
            try {
              if (colorDetecor(node.value)) {
                node.remove();
              }
            } catch (e) {
              console.error(e);
            }
          });
        }

        /*
         *  Remove all declarations that do not contain color.
         */
        rootClone.walkDecls((node) => {
          try {
            if (!colorDetecor(node.value)) {
              node.remove();
            }
          } catch (e) {
            console.error(e);
          }
        });

        const transformNode = parser[options.mergeType]({
          value: options.mergeValue,
        });

        if (!transformNode) {
          console.error(
            `${options.mergeType}:${options.mergeValue} selector invalid!`
          );
        }

        const transform = (selectors: parser.Root) => {
          selectors.each((selector: parser.Selector) => {
            if (options.mergeValue) {
              if (options.mergeMode == MergeMode.Before) {
                let combo: parser.Combinator = parser.combinator({
                  value: " ",
                });
                selector.prepend(combo as any);
                selector.insertBefore(combo, transformNode);
              }
              if (options.mergeMode == MergeMode.Merge) {
                selector.prepend(transformNode);
              }
            }

            if (options?.removeFromSelector?.length) {
              for (let el of options.removeFromSelector) {
                selector.each((node: any) => {
                  let seearchKey: any = "value";
                  if (node.type == "attribute") {
                    seearchKey = "attribute";
                  }
                  if (el.key && el.key in node) {
                    seearchKey = el.key;
                  }
                  try {
                    if (seearchKey in node) {
                      let value: any = node[seearchKey] || "";

                      if (node.type == el.type && el.match.test(value)) {
                        node.remove();
                      }
                    }
                  } catch (e) {}
                });
              }
            }
          });
        };

        rootClone.walkRules((node) => {
          if (node.parent?.type == "atrule") {
            if (
              "parent" in node &&
              "name" in node.parent &&
              node.parent?.name == "keyframes"
            ) {
              node.remove();
              return;
            }
          }
          if (node && !node?.nodes?.length) {
            node.remove();
          } else if (node) {
            parser(transform).processSync(node, {
              updateSelector: true,
            });
          }
        });

        if (!options.saveInputRules) {
          root.walkRules((node) => {
            if (node && !node?.nodes?.length) {
              node.remove();
            }
          });
          root.walkAtRules((node) => {
            if (node && !node?.nodes?.length) {
              node.remove();
            }
          });
        }

        rootClone.walkAtRules((node) => {
          if (node && !node?.nodes?.length) {
            node.remove();
          }
        });

        if (options.includeResultInOutput) {
          root.append(rootClone);
        }
        if (options.extract && "function" == typeof options.extract) {
          options.extract(rootClone);
        }
      } catch (e) {
        console.error(e);
      }
    },
  };
};
plugin.postcss = true;
export = plugin;
