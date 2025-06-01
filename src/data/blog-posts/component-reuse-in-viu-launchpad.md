---
title: "Component Reuse in VIU Launchpad"
slug: "component-reuse-in-viu-launchpad"
publishDate: "2018-02-20"
description: "Reusing components across projects is one of the most important concepts to being efficient in frontend development. Learn how to implement component reuse with NPM, handle non-JS files, and set up live-reload for efficient development."
---

# Component Reuse in VIU Launchpad

*Published: February 20, 2018*

Reusing components across projects is one of the most important concepts to being efficient in frontend development. While you could always copy & paste components from one project to the next, every project you'd be missing out on the fixes and updates that are done in other projects.

So we'd need a way to "reference" components and if possible also have a way to version the components in a clean way (e.g. use HTML as the API and show breaking changes as major version updates).

The most logical way is to reuse a tool that does all this for us: NPM. There are a few issues with this though:

* Referencing non-js files from within the package
  ◦ Especially: nunjucks templates
* Working on components while not at the same time publishing all the time to NPM repo
* Keeping packages private
* Have consistent styling

I will explain possible solutions for each bullet in the following.

## Referencing Non-JS Files from within the Package

While javascript files can be referenced with a regular

```javascript
import CrazyTeaser from '@viu/components-crazyteaser';
```

and SCSS files with

```scss
@import '../../node_modules/@viu/components-crazyteaser/index';
```

it is a bit more complicated with the HTML of the components. To be able to easily use components, we added new functionality to the launchpad. You can now use components from npm packages with the following syntax:

```nunjucks
{% component '::@viu/components-crazyteaser', crazyteaser-content %}
```

For this to work, the npm package needs to contain an index.html which provides the nunjucks template for the component.

The component can also have an index.json with default values (strongly suggested to help people with the reuse of the component).

For macros it works the same way as with "regular" macros:

```nunjucks
{% import '../node_modules/@viu/somemacro/index.html' as somemacro %}
  ...
  {%- call somemacro.test('hello world') %}{%- endcall %}
```

## Setting up Live-Reload

For live-reload to work we need to watch the additional folders. As before - this just works for javascript. For SCSS and HTML you need to override the configuration in your package.json (as you're used to from other launchpad configs):

```json
"css": {
  "watchSrc": ["./stylesheets/", "./components/", "../node_modules/@viu/"]
},
"html": {
  "watchSrc": ["./templates/", "./data/", "./components/", "../node_modules/@viu/"]
}
```

With that, launchpad will notice any changes within these folders and automatically rebuild the bundles and reload your browser(s).

## Working on Packages

It's possible of course to edit a component, publish it to npm, update the package in the project and rebuild. But this would be a pretty slow process. We want to be able to work on a component directly within its checkout folder while at the same time see the changes in the main project where the component is used. NPM-link to the rescue!

What you'd to:

* Execute "npm link" in the folder where you work on your component
* Execute "npm link @viu/component-crazyteaser" in the main project folder
* Make sure you use the same node version for both commands
* Now you can work in the component directory and the project will be live-updated
* If this does not work for you (and yes, there are still unsolved issues - especially with dependencies) just work within the node_modules/yourmodule folder and copy paste to wherever you have checked out your module.

This creates a symlink between the directories. If you get an error that babel cannot find its configuration, please let me know - we would need to integrate webpack-babel-link into webpack-multi-config. Babel has some known issues when working with symlinks.

For me, it worked to install babel-preset-env in the component folder and then removing it again - very strange.
