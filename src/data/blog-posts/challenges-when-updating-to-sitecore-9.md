---
title: "Challenges when Updating to Sitecore 9"
slug: "challenges-when-updating-to-sitecore-9"
publishDate: "2018-01-15"
description: "Every Sitecore update brings new features - but some challenges as well. Read about the ones of Sitecore 9 and how we resolved some of them for our clients."
---

# Challenges when Updating to Sitecore 9

*Published: January 15, 2018*

Every Sitecore update brings new features - but some challenges as well. Read about the ones of Sitecore 9 and how we resolved some of them for our clients.

For Bryan Adams fans, there's no need to talk about the main focus of Sitecore 9. For everyone else: It's the cloud! Of course, previous versions were already pushing for the cloud. But the 9 release is the first one which is cloud first. While this brings lots of advantages, the changes coming with version 9 also create some challenges.

As with every mayor version, number 9 changes quite a few important parts of Sitecore.

## Major Changes in Sitecore 9

**The services architecture splits Sitecore into multiple parts**
- This means switching from a single IIS instance (unscaled) to at least two IIS instances and two Windows services
- Allows for scaling specifically where you need it
- This might make your architecture a bit more complex
- Your deployment will probably need some changes

**xDB has been complemented by the xConnect API**
- This allows developers a clean and structured access to all xDB data.
- It solves many issues when writing contacts (or facets) by working with an optimistic concurrency model (vs. the pessimistic model in Sitecore 8)
- The process of working with custom facets and dimensions changed
- Some data is no longer collected in the same format as before (see [Missing Analytics Data in Sitecore 9](https://dev-blog.viu.ch/sitecore-9-empty-fact-tables))
- Data structure and supported databases have changed - you can get rid of MongoDB and store all data in SQL server. This means you might need to migrate your data (which is supported by Sitecore with a migration tool).

**Webforms for Marketers will not be supported anymore (starting with Sitecore 9.1)**
- Sitecore offers a replacement (called "Forms" and integrated into the base installation - no more module installation)
- There is no migration path, which means you will need to migrate manually or write your own scripts
- On the bright side, this finally brings cleaner markup to your forms - frontend developers will breathe a sigh of relief

**Lucene is no longer supported (except for the CMS-only version)**
- If you are not already using Solr or Azure search for your Sitecore indexes, now is the time to switch

The good thing (and I 🖤 Sitecore for that) is, that the basic content related API has been stable for a while and is stable as well for version 9 (at least for the part, we've seen until now). This means most of your custom code will still work.

While it might not be easy to upgrade, it is good to see that Sitecore is investing a lot into cleaning up their architecture and separating functionalities. While developers love to play with the newest toys anyways, there might be more critical reasons to update as well - GDPR support.

