# Postcss color extractor

This plugin separates declarations into those that contain colors and those that do not. 

The selectors of those rules that contain color declarations will be modified by adding a prefix or merging with another class or attribute of your choice. 

This is useful for organizing theme changes in a project, such as providing different color schemes. Despite the popularity of using CSS variables and :root declarations, this method can still be useful. This plugin was created for the ungic-sass framework, specifically to be used with the [ungic-sass-theme](https://www.npmjs.com/package/ungic-sass-theme) package. 

**ungic-sass-theme** package works with both css variables and color generation for different color schemes, and is the simplest way to separate a project into themes.


To use this plugin, you will first need to install it using npm:

```
npm install postcss-color-extractor
```

Then, you can include it in your PostCSS configuration file, example of webpack configuration

```js
const colorExtractor = require("postcss-color-extractor");
...
    {
        loader: "postcss-loader",
        options: {
            postcssOptions: {
                plugins: [
                    colorExtractor({
                        extract: input => {
                            console.log(input.toResult(), input.source?.input?.file);
                        }
                    })
                ]
            }
        }
    }

```


This plugin has several options that can be passed in as an object:

* The `extract` option is a callback function that takes as a parameter the extracted part of the data (a new selector containing declarations with colors). The function does not return any value.
* `includeResultInOutput`: a **boolean** that determines whether the extracted parts should be included in the final CSS output or not.
* `mergeMode`: a **string** that sets the merge mode of the selectors, can be "merge" or "before"
* `mergeType`: a **string** that sets the merge type, can be "className", "attribute", "id", "tag"
* `mergeValue`: a **string** that sets the merge value, it will be added to **mergeType**
* `removeFromSelector`: an **array** of objects containing a type and a **match** property, the plugin will remove the parts of selectors that match the type and match properties.
