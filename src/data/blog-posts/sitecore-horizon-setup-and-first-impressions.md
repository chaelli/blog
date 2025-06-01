---
title: "Sitecore Horizon - Setup and First Impressions"
slug: "sitecore-horizon-setup-and-first-impressions"
publishDate: "2019-12-03"
description: "The setup was quick - and so is the editor itself! Learn how to set up Sitecore Horizon and explore its features including drag & drop, undo/redo, and auto-saving."
---

# Sitecore Horizon - Setup and First Impressions

*Published: December 3, 2019*

The setup was quick - and so is the editor itself!

While the experience itself is a bit too low-key for my taste, the speed and tidiness feel great when compared to the Experience Editor. We will see if it's possible to keep it clean and sleek while adding all the missing functionality. If so - it would be a comfortable and quick way of editing your Sitecore content.

![Sample page in Horizon](/assets/blog/horizon-screen-1.png)

## Setup

If you want to try it yourself - it will only take you about half an hour - just follow the described steps:

• Download and install Sitecore 9.3 - I used the "Graphical setup package for XP Single" which provides an installer which completely installs Sitecore with all of its dependencies (thank you Sitecore! Great to have that feature back after a time of manual dev-installs.)

![The new Sitecore installer](/assets/blog/graphical-install.png)

• Install node (https://nodejs.org/en/download/) and make sure the folder can be read by the IIS Apppool (also check permissions if you already have node installed - and also make sure you add note to your system's PATH).

If you miss this step, the logfile of Horizon will tell you so ("Ensure that Node.js is installed and can be found in one of the PATH directories.") and the Horizon site (yes, it's a separate IIS site) will look like this:

![Horizon error screen](/assets/blog/horizon-error.png)

• Download the Horizon package from here: [https://dev.sitecore.net/Downloads/Sitecore_Horizon/93/Sitecore_Horizon_93_Initial_version.aspx](https://dev.sitecore.net/Downloads/Sitecore_Horizon/93/Sitecore_Horizon_93_Initial_version.aspx).
• Unzip the package, adjust the "parameters.ps1" (example where I used "SC93" as prefix during Sitecore installation)

```powershell
# Parameters
$ContentManagementInstanceName = "SC93sc.dev.local"
$ContentManagementWebProtocol = "https"
$SitecoreIdentityServerPhysicalPath = "C:\inetpub\wwwroot\SC93identityserver.dev.local"
$SitecoreIdentityServerPoolName = "SC93identityserver.dev.local"
$SitecoreIdentityServerSiteName = "SC93identityserver.dev.local"
$LicensePath = "C:\inetpub\wwwroot\SC93sc.dev.local\App_Data\license.xml"
```

• Execute "install.ps1" - wait - and reload the Sitecore Launchpad.

![The Sitecore Launchpad with the Horizon icon](/assets/blog/sc-launchpad.png)

## Features

**Drag & Drop**: The most obvious improvement: you can now drag new components to the page. What you cannot (yet) - at least I could not get it to work - is moving around existing components. Moreover, I was not able to select an existing component in any way. The only selectable elements are fields. What you can see as well is that the placeholder is hidden once the first component is placed in it.

![Use drag & drop to place new components on page](/assets/blog/draganddrop.gif)

**Undo/redo**: This was announced in the release notes - but for me, it only works on richtext fields for now. But together with auto-saving this will be a great feature to enhance the editing workflow and will make editors "trust" the system much more.

**Auto-saving**: This works great already. And the thing is - I didn't even notice at first - it just feels natural.

All in all, Horizon does not seem to be ready to be used. But it's great that we as developers can already try it and start checking our development also within Horizon. This way, our solutions will be ready once (hopefully soon) Horizon is ready!

---
