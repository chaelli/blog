---
title: "Sitecore 9.1 and Federated Authentication"
slug: "sitecore-9-1-and-federated-authentication"
publishDate: "2019-08-22"
description: "Sitecore 9.1 is here – and with it, the switch to federated authentication as the default authentication technology. See how we setup a quick demo on Azure using Okta as a login provider."
---

# Sitecore 9.1 and Federated Authentication

*Published: August 22, 2019*

Sitecore 9.1 is here – and with it, the switch to federated authentication as the default authentication technology. See how we setup a quick demo on Azure using Okta as a login provider.

By default, Sitecore requires an instance of IndentityServer ([https://github.com/IdentityServer/IdentityServer4](https://github.com/IdentityServer/IdentityServer4)) to work now. The Sitecore installation guide describes how this is done (with support of the Sitecore Installation Framework). But now you can choose from a lot of different identity providers - or in most cases - simply use, what is already available.

The following will describe how you can easily setup Okta as a replacement for IndentityServer – either because you don't want to have an instance running locally or because business requires the usage of an external login provider. It describes the quickest way to get there – we don't go into details on what you would need to do for a production scenario. A lot of that is described here: [https://doc.sitecore.com/developers/91/sitecore-experience-management/en/using-federated-authentication-with-sitecore.html](https://doc.sitecore.com/developers/91/sitecore-experience-management/en/using-federated-authentication-with-sitecore.html). We might go into more details in an upcoming blog.

## Setup Sitecore 9.1 in Azure as Testing Environment

If you just want to try this, without the hassle of a local setup, you can follow these steps to get the whole thing running on Azure quickly:

• Log into the Azure Portal ([https://portal.azure.com](https://portal.azure.com/) - link for the lazy ones)
• Click on "Create a Resource", search for Sitecore, select "Sitecore® Experience Cloud"
• Choose "Create", Enter a Resource Group Name (create new, do not use special characters)
• Configure required Sitecore Settings
  ◦ Environment

![Configure Sitecore Environment on Azure](/assets/blog/sitecore-azure-1.jpg)

  ◦ Credentials

![Configure Sitecore Credentials on Azure](/assets/blog/sitecore-azure-2.jpg)

  ◦ Choose a supported region

• Review the terms 😉
• Start the deployment

Now you need to wait for about 10-15 minutes. Then you'll have two new app service instances (any many other resources). Sitecore is hosted under `https://sitecore91demo-xxxxxx-single.azurewebsites.net` where xxxxxx is a 6-digit number. You can login via `/sitecore` and the password you defined during configuration.

## Configure Okta for Sitecore Login

Create a demo account on Okta. Then login and create an application that is configured like this:

![Setup Sitecore as an Application on Okta](/assets/blog/sitecore-okta-1.png)

Keep the rest as it is.

## Configure Sitecore to Work with your Okta Setup

In order for your Sitecore instance to work with your new Okta setup, you need to change one configuration file:
`Sitecore.Owin.Authentication.IdentityServer.config`

You can edit this file via "Kudu" (Azure Service) which you can reach under `https://sc91demo-xxxxxx-single.scm.azurewebsites.net/` (replace xxxxxx with the number of your instance). You'll find the file in the folder `D:\home\site\wwwroot\App_Config\Sitecore\Owin.Authentication.IdentityServer.`

![Adjust Sitecore Configuration to use Okta as Login Provider](/assets/blog/sitecore-federation-config.jpg)

Do the following changes and try to access the Sitecore Launchpad (in an incognito browser if were logged in previously).

## Assigning a role / administrative privileges to the User

After the first login attempt (that will fail), you will find a new user in the user manager of your Sitecore instance. Mark this user as an administrator (or apply roles) so he has access to the Sitecore backend. After that, login again – this time it will work, and you'll land on the Sitecore Launchpad – mission complete!
