---
title: "Clean Richtext Content in Sitecore"
slug: "clean-richtext-content-in-sitecore"
publishDate: "2019-05-20"
description: "With a simple trick, editors will create cleaner html in the richtext editor. Learn how to use CSS to provide visual feedback on HTML quality in Sitecore's rich text editor."
---

# Clean Richtext Content in Sitecore

*Published: May 20, 2019*

With a simple trick, editors will create cleaner html in the richtext editor.

I must confess that this wasn't my idea - but - I'm still going to share it for others to use. It's a small first try on the topic - this can of course be extended a lot.

A general issue with richtext fields (in almost any CMS) is the quality of the code that is being generated. While some editors will try to create clean code and will even check the generated html for quality issues, many will not or cannot. Without looking into the html code, there is no direct feedback on the quality of the generated content. Which leaves the editors helpless to improve their editing skills.

A small extension to your rte.css file (or however you named it) can help with that. Have a look at the following code:

```css
p {
  border: 1px dotted green;
  padding: 4px 0;
  margin: 10px 0;
  line-height: 22px;
}

ul,
ol {
  border: 1px dotted blue;
}

li {
  border: 1px dashed lightblue;
  margin: 2px;
}

br {
  content: "";
}

br::before {
  content: "";
  display: inline-block;
  width: 12px;
  height: 16px;
  margin-left: 3px;
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEyOCAxMjgiIGhlaWdodD0iMTI4cHgiIGlkPSLQodC70L7QuV8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9I...");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 0 5px;
}

br::after {
  content: "";
  display: block;
}

span,
font {
  border: 1px dashed red;
  background: rgba(255, 192, 203, 0.5);
}
```

The code will show the editor what elements have been created by the richtext editor. So it's easy to see if someone created a spacing by using `<br><br><br>`. While this doesn't automatically fixes things (this might or might not be an alternative in your case), it allows the editor to see what happens and to fix it.

See an example here:

![Rich Text Editor with visual indicators](/assets/blog/rte.png)

A small issue with the above code is, that the styling of `<br>`s doesn't work in Firefox. This is probably by design - according to specs, the `<br>`-element should only support margins and no additional styling. Luckily for this use-case, Chrome and Internet Explorer do not care and just allow "some" styling. The "hack" above was done by one of our frontend wizards (thanks @ Simon).

