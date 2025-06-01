---
title: "Getting data from Sitecore Commerce Engine into your Website"
slug: "getting-data-from-sitecore-commerce-engine-into-your-website"
publishDate: "2018-02-25"
description: "What sounds simple can be pretty complex. Learn how to create a plugin to extract data from Sitecore Commerce Engine, set up the service proxy, and access the new API from your website."
---

# Getting data from Sitecore Commerce Engine into your Website

*Published: February 25, 2018*

What sounds simple can be pretty complex.

The issue that first made me dive into this was that Sitecore Commerce (8.2.1 in this case) doesn't offer any order management to speak off. Either you use an external system to manage your orders or you are left with an unfilterable list of orders, a detail view and the option to change the status of an order in the predefined way.

What we wanted to build was a simple interface where orders could be listed by shop (multi-site solution, but single solution) and status could be changed more flexibility. We also wanted to be resilient to any feature Sitecore and/or Sitecore Commerce updates.

So, the first step seemed easy enough - getting a filtered list of orders from the Sitecore Commerce Engine to be able to list them.

This took me quite long to figure out - maybe because I am new to the topic or maybe because documentation is scarce at best or because Microsoft did not implement great error handling in their odata implementation. Anyway - to speed up everyone trying to do the same, the following describes the process to get it working an also sheds some light on the issues I had during the development.

## Write the plugin

### 1. Create a new plugin project in your engine solution

You cannot use the sample plugin if you are not using the Reference Storefront. But you can just create a new project within the Sitecore Commerce Engine solution which should look like this:

![Project structure](/assets/blog/engine-plugin-structure.jpg)

If you have not yet set up your Sitecore Commerce Engine solution, you can get started with the "Customer.Sample.Solution.sln" from the SDK.

### 2. Create the class CommerceController like this:

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using Sitecore.Commerce.Core;
using Sitecore.Commerce.Plugin.Orders;

using VIU.Commerce.Plugin.OrderManagement.Commands;

namespace VIU.Commerce.Plugin.OrderManagement.Controller
{
    [Route("api")]
    [Microsoft.AspNetCore.OData.EnableQuery]
    public class OrdersController : CommerceController
    {
        public OrdersController(IServiceProvider serviceProvider, CommerceEnvironment globalEnvironment)
            : base(serviceProvider, globalEnvironment)
        {
        }

        [HttpGet]
        [Microsoft.AspNetCore.OData.EnableQuery]
        [Route("GetOrders(shopName={shopName},excludeStatus={excludeStatus})")]
        public async Task<IActionResult> GetOrders(string shopName, string excludeStatus)
        {
            GetOrdersCommand getOrdersCommand = this.Command<GetOrdersCommand>();

            // unfortunately enumerable as parameter didn't work with the current odata version
            string[] excludeStatusArr = excludeStatus.Split(new[] { '|' }, StringSplitOptions.RemoveEmptyEntries);

            IEnumerable<Order> orders = await getOrdersCommand.Process(this.CurrentContext, shopName, excludeStatusArr);

            return new ObjectResult(orders);
        }
    }
}
```

### 3. Then create a class for the Command

The command used to get the orders is simple but ugly - inputs on how to do this nicely are welcome ;)

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Sitecore.Commerce.Core;
using Sitecore.Commerce.Core.Commands;
using Sitecore.Commerce.Plugin.Orders;

namespace VIU.Commerce.Plugin.OrderManagement.Commands
{
    public class GetOrdersCommand : CommerceCommand
    {
        public GetOrdersCommand(
            IServiceProvider serviceProvider) : base(serviceProvider)
        {
        }

        public async Task<IEnumerable<Order>> Process(CommerceContext commerceContext, string shopName, string[] excludedStatus)
        {
            try
            {
                IEnumerable<Order> orders = (await this.Command<FindEntitiesInListCommand>().Process<Order>(commerceContext, CommerceEntity.ListName<Order>(), 0, Int32.MaxValue)).Items.ToList<Order>();

                return orders.Where(o => shopName.Equals(o.ShopName) && !excludedStatus.Contains(o.Status)).ToList();
            }
            catch (Exception e)
            {
                return await Task.FromException<List<Order>>(e);
            }
        }
    }
}
```

### 4. Register the controller in the ConfigureServiceApiBlock.

This makes sure that the controller/action are available and that it will be used in the proxy generation (coming to that later).

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.OData.Builder;

using Sitecore.Commerce.Core;
using Sitecore.Commerce.Core.Commands;
using Sitecore.Commerce.Plugin.Orders;
using Sitecore.Framework.Conditions;
using Sitecore.Framework.Pipelines;

namespace VIU.Commerce.Plugin.OrderManagement.Pipelines.Blocks
{
    public class ConfigureServiceApiBlock : PipelineBlock<ODataConventionModelBuilder, ODataConventionModelBuilder, CommercePipelineExecutionContext>
    {
        private readonly IPersistEntityPipeline _pipeline;

        public ConfigureServiceApiBlock(IPersistEntityPipeline persistEntityPipeline)
        {
            this._pipeline = persistEntityPipeline;
        }

        public override Task<ODataConventionModelBuilder> Run(ODataConventionModelBuilder modelBuilder, CommercePipelineExecutionContext context)
        {
            Condition.Requires(modelBuilder).IsNotNull($"{base.Name}: The argument can not be null");

            FunctionConfiguration functionCconfiguration = modelBuilder.Function("GetOrders");
            functionCconfiguration.ReturnsCollectionFromEntitySet<Order>("Orders"); // needs to be called "Orders" because it is predefined in Sitecore.Commerce.Plugin.Orders.ConfigureServiceApiBlock
            functionCconfiguration.Parameter<string>("shopName");
            functionCconfiguration.Parameter<string>("excludeStatus");

            return Task.FromResult(modelBuilder);
        }
    }
}
```

### 5. Class

Create a "ConfigureSitecore" class in your plugin project where you register the ConfigureServiceApiBlock (this will make sure that the above code is executed when the plugin is initialized)

```csharp
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

using Sitecore.Commerce.Core;
using Sitecore.Framework.Configuration;
using Sitecore.Framework.Pipelines.Definitions.Extensions;

namespace VIU.Commerce.Plugin.OrderManagement
{
    public class ConfigureSitecore : IConfigureSitecore
    {
        public void ConfigureServices(IServiceCollection services)
        {
            Assembly assembly = Assembly.GetExecutingAssembly();
            services.RegisterAllPipelineBlocks(assembly);

            services.Sitecore().Pipelines(config => config
                .ConfigurePipeline<IConfigureServiceApiPipeline>(c => c.Add<Pipelines.Blocks.ConfigureServiceApiBlock>()));

            services.RegisterAllCommands(assembly);
        }
    }
}
```

If you now start the engine project with IIS Express, you should see the new endpoint in the xml (displayed in Internet Explorer after the solution started).

```xml
<Function Name="GetOrders">
  <Parameter Name="shopName" Type="Edm.String" Unicode="false"/>
  <Parameter Name="excludeStatus" Type="Edm.String" Unicode="false"/>
  <ReturnType Type="Collection(Sitecore.Commerce.Plugin.Orders.Order)"/>
</Function>
```

**Important**: If one line is missing (e.g. shopName parameter) then this means that right before that definition (or usually on the line that defines the first missing element) there is an error. So errors are not usually printed - everything defined after the error is just missing from the XML.

Now you should be able to request the orders via a simple request (e.g. try it with Postman - if you're not using Postman yet, get started by using "Postman.zip" from within the SDK. And really - use Postman if you are not yet - you will not be working efficiently without it!)

![Example Postman Request](/assets/blog/example-postman-request.jpg)

## Rebuild the ServiceProxy

To be able to access the new controller from within your Sitecore solution, you need to regenerate the proxy class (Sitecore.Commerce.ServiceProxy).

![OData Connection](/assets/blog/odata-connection.jpg)

1. Copy the Service Proxy solution (Sitecore.Commerce.ServiceProxy.slnSDK) from the commerce SDK into a folder that has no spaces in the page (if you are this far, this will probably not surprise you ;)
2. Use "Add Connected Service" to install "OData Connected Service" (at least if you are using VS 2017). You need to click on "Find more services…" to be able to search for "OData Connected Service"
3. Right click the file "CommerceApiClient.tt" and choose "Run custom tool". This regenerates the code. Now you can build the project.
4. Copy the resulting Sitecore.Commerce.ServiceProxy.dll into your Sitecore project and reference it

## Access the new API

To access the new api and get all orders by shop and status, you can use the following snippet:

```csharp
IEnumerable<Sitecore.Commerce.Plugin.Orders.Order> orders = Proxy.Execute<Order>(EngineConnectUtility.GetShopsContainer(string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, new DateTime?()).GetOrders("viuDefault", string.Join("|", new [] {"Completed"}))).ToList();
```

That's it - quite a process to get a bit of data from the engine. But once an example is working, extending it is pretty straight forward.

## Further reading

The two blogs that helped me most, when implementing the above described where:

• [Sitecore commerce – Adding and setting new fields on the cart. An end to end example, from UI to API.](https://websterian.com/2017/10/09/sitecore-commerce-adding-and-setting-new-fields-on-the-cart-an-end-to-end-example/) by websterian
• [Sitecore Commerce 8.2.1 — Working with Commerce Engine APIs](https://medium.com/@prabathcy/sitecore-commerce-commerce-engine-api-design-4aaad6de7d6f) by Prabath Yapa
