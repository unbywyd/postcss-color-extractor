"use strict";
const package_json_1 = require("../package.json");
const types_1 = require("./types");
const utils_1 = require("./utils");
const parser = require("postcss-selector-parser");
const plugin = (opts) => {
    const options = {
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
        mergeMode: types_1.MergeMode.Before,
        mergeType: types_1.SelectorType.ClassName,
        mergeValue: "theme",
        ...(opts || {}),
    };
    // check options
    if (!Object.values(types_1.SelectorType).includes(options.mergeType)) {
        throw new Error(`mergeType must be one of ${Object.values(types_1.SelectorType).join(",")}`);
    }
    if (!Object.values(types_1.MergeMode).includes(options.mergeMode)) {
        throw new Error(`mergeMode must be one of ${Object.values(types_1.MergeMode).join(",")}`);
    }
    return {
        postcssPlugin: package_json_1.name,
        Once(root) {
            try {
                const rootClone = root.clone();
                /*
                 *    Remove all color declarations
                 */
                root.walkDecls((node) => {
                    try {
                        if ((0, utils_1.colorDetecor)(node.value)) {
                            node.remove();
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                });
                /*
                 *  Remove all declarations that do not contain color.
                 */
                rootClone.walkDecls((node) => {
                    try {
                        if (!(0, utils_1.colorDetecor)(node.value)) {
                            node.remove();
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                });
                const transformNode = parser[options.mergeType]({
                    value: options.mergeValue,
                });
                const transform = (selectors) => {
                    selectors.each((selector) => {
                        if (options.mergeMode == types_1.MergeMode.Before) {
                            let combo = parser.combinator({ value: " " });
                            selector.prepend(combo);
                            selector.insertBefore(combo, transformNode);
                        }
                        if (options.mergeMode == types_1.MergeMode.Merge) {
                            selector.prepend(transformNode);
                        }
                        if (options?.removeFromSelector?.length) {
                            for (let el of options.removeFromSelector) {
                                selector.each((node) => {
                                    let seearchKey = "value";
                                    if (node.type == "attribute") {
                                        seearchKey = "attribute";
                                    }
                                    if (el.key && el.key in node) {
                                        seearchKey = el.key;
                                    }
                                    let value = node[seearchKey] || "";
                                    if (node.type == el.type && el.match.test(value)) {
                                        node.remove();
                                    }
                                });
                            }
                        }
                    });
                };
                rootClone.walkRules((node) => {
                    if (node.parent?.type == "atrule") {
                        if ("parent" in node &&
                            "name" in node.parent &&
                            node.parent?.name == "keyframes") {
                            node.remove();
                            return;
                        }
                    }
                    if (node && !node?.nodes?.length) {
                        node.remove();
                    }
                    else if (node) {
                        if (transformNode) {
                            parser(transform).processSync(node, {
                                updateSelector: true,
                            });
                        }
                        else {
                            console.error(`${options.mergeType}:${options.mergeValue} selector invalid!`);
                        }
                    }
                });
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
            }
            catch (e) {
                console.error(e);
            }
        },
    };
};
plugin.postcss = true;
module.exports = plugin;
//# sourceMappingURL=index.js.map