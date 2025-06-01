---
title: "Missing Analytics Data in Sitecore 9"
slug: "missing-analytics-data-in-sitecore-9"
publishDate: "2018-04-30"
description: "Sitecore 9 does not provide the same reporting data as older versions - learn what to do if you are using the old data structures and how to collect missing data using custom processors."
---

# Missing Analytics Data in Sitecore 9

*Published: April 30, 2018*

Sitecore 9 does not provide the same reporting data as older versions - what to do if you are using the old data structures?

If you are using external tools to analyze your Sitecore analytics data (based on xDB) or you have your own reports based on the reporting database, you'll notice that most of the Fact_* tables are not updated with new data or that most columns show empty values.

Most important cases of missing values:

• **Contacts table**: This table stays completely empty. It was often used to relate a contact id to a logged in user on a database level.
• **Fact_PageViews.ContactId column**: Contains only empty values.
• **Fact_Visits.ContactId column**: Contains only empty values.

If your solution requires this data for reports or to feed an external system with analytics data, you will need to find a way to still get the necessary values. While this could be done in code (the new xConnect API will give you a lot of possibilities), it most certainly will be too slow for reporting use-cases.

## Collect the Missing Data

As Sitecore offers an extensive API you can collect the data yourself relatively easy and keep your reporting running as before. The following steps can guide you through the process:

1. Create a new table with the same structure as the one you used before
2. Copy all data from the old table into the new (you need to do that when you go live with the new implementation, to get all existing data into the new table
3. Create an InteractionAggregationPipelineProcessor (based on `Sitecore.Analytics.Aggregation.Pipeline.InteractionAggregationPipelineProcessor`) and make sure you use the UsesInteractionFacets attribute to define the facets you need.

Within that processor, you can access all data of the interaction (visit) and the contact. You can then save this data into your new tables and therefore make sure, that they stay up-to-date with new visits.

## Custom Data

As you probably have custom facets, you'll need to do the same for the tables reflecting these facets (they will no longer be automatically populated). This should be pretty straight forward. The only thing you need to remember is, that custom facets that you write into `Sitecore.Analytics.Tracker.Current.Interaction.CustomValues` are no longer available automatically in the processor. To access this data in the processor, you need a processor based on `ConvertToXConnectInteractionProcessorBase` that reads the data and writes it into a facet (which you have registered in xConnect). After that, you can read the facet from within the processor.

Example of a ConvertToXConnectInteractionProcessor:

```csharp
using LIC.Website.Logic.Analytics;
using Sitecore.Analytics.XConnect.DataAccess.Pipelines.ConvertToXConnectInteractionPipeline;

namespace LIC.Website.Logic.Pipelines.Analytics
{
  public class InteractionExtendedProcessor : ConvertToXConnectInteractionProcessorBase
  {
    public override void Process(ConvertToXConnectInteractionPipelineArgs args)
    {
      if (args == null)
      {
        return;
      }

      var customValues = args.TrackerVisitData.CustomValues;

      if (!customValues.ContainsKey(InteractionExtended.DefaultFacetKey))
      {
        return; // no extended data has been written (ok for visits where this facet is not available)
      }
      var interactionExtendedFacet = customValues[InteractionExtended.DefaultFacetKey];

      if (interactionExtendedFacet != null && interactionExtendedFacet is InteractionExtended)
      {
        args.Facets.Add(InteractionExtended.DefaultFacetKey, interactionExtendedFacet as InteractionExtended);
      }
    }
  }
}
