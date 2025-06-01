---
title: "Force Managed Links in Sitecore"
slug: "force-managed-links-in-sitecore"
publishDate: "2019-07-23"
description: "Make sure your editors do not use external links for internal targets - and with that - make sure internal links never break! Learn how to create a custom validator to enforce managed links."
---

# Force Managed Links in Sitecore

*Published: July 23, 2019*

Make sure your editors do not use external links for internal targets - and with that - make sure internal links never break!

Links are the foundation of the world wide web. In their simplicity they provide the most important tool for any reader of your web content. But ever so often links lead to errors (404 / not found) because they are no longer valid. Sitecore provides a managed link functionality that makes sure that links do not break even if pages are moved or whole areas of your website are restructured.

Unfortunately, many editors just copy the url of the page they want to link to and use the external link functionality with that url even for internal pages. These urls link to Sitecore-internal content but are not managed anyway and will therefore break if the target is moved. The editors also will not see a warning if they are to delete the target item.

To prevent that, we created a simple solution - a custom validator. Sitecore validators are very (VERY) flexible - but we won't go into details about that here. It's enough to say that we can create our own validators.

The code of the validator looks like this:

```csharp
[Serializable]
public class ForceInternalLinksInRTE : StandardValidator
{
    private readonly string HrefPattern = "href\\s*=\\s*(?:[\"'](?<1>[^\"']*)[\"']|(?<1>\\S+))";
    private readonly IEnumerable<string> ForbiddenHosts = Sitecore.Configuration.Settings.GetSetting("VIU.Foundation.Editing.Validation.ForbiddenHosts").ToLower().Split('|');

    public override string Name
    {
        get { return "Force Internal Links in RTE Validator"; }
    }

    public ForceInternalLinksInRTE() { }

    public ForceInternalLinksInRTE(SerializationInfo info, StreamingContext context) : base(info, context) { }

    protected override ValidatorResult Evaluate()
    {
        var text = this.ControlValidationValue;
        if (string.IsNullOrEmpty(text))
        {
            return ValidatorResult.Valid;
        }

        var matches = Regex.Matches(text, HrefPattern);
        var issues = matches.Cast<Match>().Where(m => m.Groups.Count == 2).Select(m => m.Groups[1].Value.ToLower()).Where(m => ForbiddenHosts.Any(f => m.StartsWith(f)));
        if (issues.Count() == 0)
        {
            return ValidatorResult.Valid;
        }

        this.Text = this.GetText("The Richtext contains the following external links, that should be internal links \"{0}\".", string.Join(", ", issues));
        // return the failed result value defined in the parameters for this validator; if no Result parameter
        // is defined, the default value FatalError will be used
        return this.GetFailedResult(ValidatorResult.CriticalError);
    }

    protected override ValidatorResult GetMaxValidatorResult()
    {
        return this.GetFailedResult(ValidatorResult.CriticalError);
    }

    /// <summary>
    /// Had to be overwritten, as sitecore will try to load the validation item from the context db which is core.. won't work for us
    /// </summary>
    protected override string GetText(string fallbackText, params string[] arguments)
    {
        var database = Factory.GetDatabase(base.ItemUri.DatabaseName, false);
        var validationText = database?.GetItem(base.ValidatorID)?["text"];

        if (!string.IsNullOrEmpty(validationText))
        {
            return base.GetText(validationText, arguments);
        }

        return base.GetText(fallbackText, arguments);
    }
  }
```

In addition to the code, you obviously need to create a validator item under `/sitecore/system/Settings/Validation Rules/Field Rules` that links to the class created above and also specifies the error level you want this validator to have (allowing you to prevent editors from saving when the validation fails or just to show an error message). You will then need to add this new item to the Richtext validators by adding it to the fields on `/sitecore/system/Settings/Validation Rules/Field Types/Rich Text`. If you only want to add this validator to specific fields, you can do so as well (just add it to the field definition item directly).
