---
title: "Fun Fact about Emojis"
slug: "fun-fact-about-emojis"
publishDate: "2019-06-23"
description: "Some emojis are created from multiple emojis - let's see what that means! Discover how emoji length works in JavaScript and learn about composite emojis."
---

# Fun Fact about Emojis

*Published: June 23, 2019*

Some emojis are created from multiple emojis - let's see what that means!

Emojis are everywhere - from mobile phones to big screens on Times Square. Since chat apps support the quick way to communicate emotions, the success of the little images is unstoppable. With modern intranets and business chat applications, emojis are also part of everyones work-day.

Fortunately, we usually do not need to care about how they work. But it can still be very interesting to look under the hood. Thanks to [Jøran Vagnby Lillesand](https://blogg.bekk.no/@lillesand) for his lightning talk at NDC Oslo that explained how emojis work. The following is based on the information in the talk and the result of some playing around with javascript and a lot of emojis ;)

## The initial question is: How "long" is an emoji?

What's the length of an emoji? or better - how many bytes are needed to represent an emoji in unicode.

```javascript
'🙂'.length
1 // makes sense

'👪'.length
2 // ook... should be 3 - but javascript is not a math language per se

'😎'.length
2 // hmmm...

'👁️‍🗨️'.length
5 // interesting

'👩‍❤️‍💋‍👨'.length
11 // wow! the love is big with this one
```

So, what is this all about? `length=1` and `length=2` can be explained by javascripts use of UTF-16. In UTF-16 the most used characters are represented by 1 byte, the less often used (not within the first 65536 characters) are represented by 2 bytes.

It's a bit more complex for the other ones. The are actually created from multiple emojis that are combined with an invisible character or - in the case of skin-tones - have a color-modifier behind the main emoji.
