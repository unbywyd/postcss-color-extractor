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
    mergeType: SelectorType.ClassName,
    mergeValue: "theme",
    ...(opts || {}),
  };

  return {
    postcssPlugin: name,
    Once(root) {
      const rootClone = root.clone();

      /*
       *    Remove all color declarations
       */
      root.walkDecls((node) => {
        if (colorDetecor(node.value)) {
          node.remove();
        }
      });

      /*
       *  Remove all declarations that do not contain color.
       */
      rootClone.walkDecls((node) => {
        if (!colorDetecor(node.value)) {
          node.remove();
        }
      });

      const transformNode = parser[options.mergeType]({
        value: options.mergeValue,
      });
      const transform = (selectors: parser.Root) => {
        selectors.each((selector: parser.Selector) => {
          if (options.mergeMode == MergeMode.Before) {
            let combo: parser.Combinator = parser.combinator({ value: " " });
            selector.prepend(combo as any);
            selector.insertBefore(combo, transformNode);
          }
          if (options.mergeMode == MergeMode.Merge) {
            selector.prepend(transformNode);
          }
          if (options.removeFromSelector.length) {
            for (let el of options.removeFromSelector) {
              selector.each((node) => {
                let seearchKey: any = "value";
                if (node.type == "attribute") {
                  seearchKey = "attribute";
                }
                if (el.key && el.key in node) {
                  seearchKey = el.key;
                }
                let value: any = node[seearchKey] || "";

                if (node.type == el.type && el.match.test(value)) {
                  node.remove();
                }
              });
            }
          }
        });
      };
      rootClone.walkRules((node) => {
        if (!node.nodes.length) {
          node.remove();
        } else {
          if (transformNode) {
            parser(transform).processSync(node, {
              updateSelector: true,
            });
          } else {
            console.error(
              `${options.mergeType}:${options.mergeValue} selector invalid!`
            );
          }
        }
      });

      root.walkRules((node) => {
        if (!node.nodes.length) {
          node.remove();
        }
      });
      root.walkAtRules((node) => {
        if (!node.nodes.length) {
          node.remove();
        }
      });

      rootClone.walkAtRules((node) => {
        if (!node.nodes.length) {
          node.remove();
        }
      });

      if (options.includeResultInOutput) {
        root.append(rootClone);
      }
      if (options.extract && "function" == typeof options.extract) {
        options.extract(rootClone);
      }
    },
  };
};
plugin.postcss = true;
export = plugin;
