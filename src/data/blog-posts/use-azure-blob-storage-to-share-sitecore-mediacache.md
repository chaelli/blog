---
title: "Use Azure Blob Storage to Share Sitecore MediaCache"
slug: "use-azure-blob-storage-to-share-sitecore-mediacache"
publishDate: "2021-01-21"
description: "When multiple delivery servers are running, each one of them renders all used image sizes. To reduce the performance overhead, we share the prerendered image by using a shared storage (Azure Blob Storage) as MediaCache."
---

# Use Azure Blob Storage to Share Sitecore MediaCache

*Published: January 21, 2021*

When multiple delivery servers are running, each one of them renders all used image sizes. To reduce the performance overhead, we share the prerendered image by using a shared storage (Azure Blob Storage) as MediaCache.

Sitecore by default uses a local folder (App_Data/MediaCache) to store prerendered images. This allows it to only resize the image once per size and version. While this is the perfect solution for one server with rare deployments, it has some downsides in setups with multiple delivery servers, dynamic App Service sizing and/or frequent deployments (at least if you clear the App_Data folder during the deployment). In these cases, the images are often rerendered which needs a lot of processing power and creates load on your SQL database. If you further enhance your image processing (e.g. provide WebP or optimized JPEGs with the great [Dianoga](https://github.com/kamsar/Dianoga) module) this aggravates the issue.

Based on the great starting point by [Per Osbeck](https://medium.com/@osbeck.per/sitecore-azure-blob-cache-media-provider-45bd6aa533bf) (uses older Azure libraries), we created a MediaCache implementation that stores all prerendered images in Azure Blob Storage. The following will explain how and also provide the code. Before you implement it, check the following:

* Do I already use a custom MediaProvider (e.g. some configurations of the above mentioned Dianoga module require this)
  ◦ if so, can I override / extend it and do I feel comfortable of doing so?
* Do I need this? (do I clear MediaCache during deployment or do we spin-up instances often?)
* Will a CDN handle all the work anyway?
* Do I use different datacenters for my delivery-servers? (access to a blob storage in another Azure region will add some overhead)

If you are sure, you want to try it, first create a AzureBlobMediaCacheRecord class that handles the up-/download of the stream data from and to the blob storage:

```csharp
using System;
using System.IO;
using System.Web;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Sitecore.Resources.Media;
using ScMedia = Sitecore.Resources.Media.Media; // because we are using "Media" as namespace

namespace VIU.Feature.Media.AzureMediaCache
{
    public class AzureBlobMediaCacheRecord
    {
        public virtual bool HasStream => memstream != null;
        public ScMedia Media { get; private set; }
        public MediaOptions Options { get; private set; }
        public MediaStream Stream { get; private set; }
        private MemoryStream memstream;
        private string cachedFilename;
        private string cachedFilePath;
        private BlobContainerClient containerClient;

        public AzureBlobMediaCacheRecord( BlobContainerClient blobContainerClient ) => containerClient = blobContainerClient;
        public AzureBlobMediaCacheRecord( BlobContainerClient blobContainerClient, ScMedia media, MediaOptions options, MediaStream stream ) => Initialize(blobContainerClient, media, options, stream);
        public AzureBlobMediaCacheRecord( BlobContainerClient blobContainerClient, ScMedia media, MediaOptions options ) => Initialize(blobContainerClient, media, options, null);

        protected virtual void Initialize( BlobContainerClient blobContainerClient, ScMedia sitecoreMedia, MediaOptions mediaOptions, MediaStream mediaStream )
        {
            containerClient = blobContainerClient;
            Media = sitecoreMedia;
            Options = mediaOptions;
            Stream = mediaStream;

            // This is a hash of the filename incl. all parameters that affect the resulting image (e.g. "12412767ab7676c76.jpg")
            var cacheKey = GetCacheKey();
            cachedFilename = CreateChecksumFileName(cacheKey, Options.CustomOptions["extension"] ?? Media.Extension); // used to separate between jpg and webp

            // This creates a folder structure to organize files better (e.g. /web/123/12412767ab7676c76.jpg)
            cachedFilePath = GetCachedPath( blobContainerClient.Uri.ToString(), cacheKey, cachedFilename);

            if (mediaStream != null)
            {
                memstream = new MemoryStream();
                mediaStream.CopyTo(memstream);
            }
        }

        /// <summary>
        /// Tries to retrieve the stream from the blob storage
        /// </summary>
        /// <returns></returns>
        public virtual MediaStream GetStream()
        {
            var extension = Options.CustomOptions["extension"] ?? Media.Extension;
            if (memstream == null)
            {
                var blobPath = cachedFilePath.Substring(containerClient.Uri.ToString().Length + 1);
                var blockBlob = containerClient.GetBlobClient(blobPath);
                if (blockBlob.Exists())
                {
                    memstream = new MemoryStream();
                    blockBlob.DownloadTo(memstream);
                }
            }
            if (memstream != null)
            {
                return new MediaStream(memstream, extension, Media.MediaData.MediaItem);
            }

            return null;
        }

        /// <summary>
        /// Stores the image data into the blob storage
        /// </summary>
        public virtual void Persist()
        {
            var blobPath = cachedFilePath.Substring(containerClient.Uri.ToString().Length + 1);
            var blockBlob = containerClient.GetBlobClient(blobPath);
            if (!blockBlob.Exists())
            {
                memstream.Seek(0, SeekOrigin.Begin);
                try
                {
                    blockBlob.Upload(memstream, new BlobUploadOptions
                    {
                        HttpHeaders = new BlobHttpHeaders
                        {
                            ContentType = MimeMapping.GetMimeMapping(blobPath)
                        }
                    });
                }
                catch (Exception e)
                {
                    Sitecore.Diagnostics.Log.Error("AzureBlobMediaCacheRecord: Could not upload file: " + e.Message, e, this);
                }
            }
        }

        private string GetCachedPath( string rootFolder, string cacheKey, string fileName )
        {
            return string.Join("/", rootFolder, Media.MediaData.MediaItem.Database.Name, ((byte)cacheKey.GetHashCode()).ToString(), fileName);
        }

        private string CreateChecksumFileName( string cachekey, string extension )
        {
            return $"{cachekey.GetHashCode()}.{extension}";
        }

        private string GetCacheKey()
        {
            return string.Join("?", Media.MediaData.MediaId, Options.GetCacheKey());
        }
    }
}
```

The Initialize method mainly defines the correct filename. The real "work" is done in GetStream (loading data from blob storage) and Persist (storing data).

After this is done, you need to create your own MediaCache - you can inherit from Sitecore.Resources.Media.MediaCache. The following is our implementation:

```csharp
using System;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Sitecore.Configuration;
using Sitecore.Resources.Media;
using ScMedia = Sitecore.Resources.Media.Media; // because we are using "Media" as namespace

namespace VIU.Feature.Media.AzureMediaCache
{
    public class AzureBlobMediaCache : MediaCache
    {
        private readonly BlobContainerClient containerClient;

        public AzureBlobMediaCache()
        {
            containerClient = new BlobContainerClient(Settings.GetSetting("VIU.Feature.Media.AzureStorageConnectionString"), Settings.GetSetting("VIU.Feature.Media.AzureBlobStorageContainer"));
        }

        protected override MediaCacheRecord GetCacheRecord( ScMedia media, MediaOptions options ) => throw new NotImplementedException();
        protected override MediaCacheRecord CreateCacheRecord( ScMedia media, MediaOptions options, MediaStream stream ) => throw new NotImplementedException();
        
        protected virtual AzureBlobMediaCacheRecord GetAzureBlobCacheRecord( ScMedia media, MediaOptions options )
        {
            return new AzureBlobMediaCacheRecord(containerClient, media, options);
        }

        public override bool AddStream( ScMedia media, MediaOptions options, MediaStream stream, out MediaStream cachedStream )
        {
            cachedStream = null;
            var cacheRecord = CreateAzureBlobCacheRecord(media, options, stream);
            if (cacheRecord == null)
            {
                return false;
            }
            cachedStream = cacheRecord.GetStream();
            if (cachedStream == null)
            {
                return false;
            }
            cacheRecord.Persist();
            return true;
        }

        protected virtual AzureBlobMediaCacheRecord CreateAzureBlobCacheRecord( ScMedia media, MediaOptions options, MediaStream stream )
        {
            if (string.IsNullOrEmpty(media.MediaData.MediaId))
            {
                return null;
            }
            return new AzureBlobMediaCacheRecord(containerClient, media, options, stream);
        }

        public override MediaStream GetStream( ScMedia media, MediaOptions options )
        {
            var cacheRecord = GetAzureBlobCacheRecord(media, options);
            if (cacheRecord == null)
            {
                return null;
            }
            return cacheRecord.GetStream();
        }
    }
}
```

Now the only part missing is the creation of a new MediaProvider. If you already have a custom MediaProvider, you can (depending on your implementation) just add a few lines of code. If not, just create a class that inherits from Sitecore.Resources.Media.MediaProvider:

```csharp
public class YourCustomMediaProvider : MediaProvider
{
        // overrides media cache location to azure blob storage
        public override MediaCache Cache
        {
            get => cache;
            set => cache = (AzureBlobMediaCache)value;
        }

        private AzureBlobMediaCache cache = new AzureBlobMediaCache();
}
```

And then - as with most Sitecore customizations, you need some config patching (and an Azure blob storage container of course ;):

```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <settings>
      <setting name="VIU.Feature.Media.AzureStorageConnectionString" value="BlobEndpoint=..." />
      <setting name="VIU.Feature.Media.AzureBlobStorageContainer" value="..." />
    </settings>
    <mediaLibrary>
      <mediaProvider patch:instead="*" type="VIU.Feature.Media.CustomMediaProvider, VIU.Feature.Media">
        <!-- your media provider settings -->
      </mediaProvider>
    </mediaLibrary>
  </sitecore>
</configuration>
```

And now, that you could quickly copy&paste this thing together - use your time to do some testing (correct images even after attaching new version? performance good enough?).

