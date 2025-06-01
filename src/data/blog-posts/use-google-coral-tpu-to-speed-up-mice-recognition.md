---
title: Use Google Coral TPU to speed up Mice recognition
slug: use-google-coral-tpu-to-speed-up-mice-recognition
publishDate: 19 Oct 2019
description: To stay ahead of my cat, I've made some updates to its cat door using Google Coral TPU for faster AI recognition.
---

![Google Coral TPU setup](/assets/blog/google-coral-1200.jpg)

This is an update to the blog post ["Use AI to Keep Mice out of the House"](/blog/use-ai-to-keep-mice-out-of-the-house).

The first thing that I updated wasn't even the image recognition itself. Once again it showed, that it is extremely important to get the basics right. The issue was that the tripod holding the camera and the Raspberry Pi was moved around quite often (either by my cat or by a human trying to clean or just walking into it). It was very time consuming to always make sure it was placed correctly. And it showed that the image recognition was not good at working with different angles or distances - so it was key to have it in the same exact position all the time.

To solve that issue, I 3d-printed a camera holder and an arm that could be moved into a good position and fixed there. The following image shows one piece of the puzzle.

![3D printed camera mount element](/assets/blog/3d-element.png)

And here you can see the complete "construction". It has a bit more separate parts as necessary, as my printer is limited to about 20cm long elements. You can also see that one of my printed screws had to be replaced by a regular one. Printing screws is not something I can recommend - but I just didn't have the right screws at home back then - and once you have a 3d printer... ;)

![Complete camera holder construction](/assets/blog/camera-holder.jpg)

![Camera holder assembly](/assets/blog/camera-holder.jpg)

## Need for Speed

As already mentioned in the first part of the blog - speed is everything. And after I tried everything to improve in this area and just could not get below about 700ms for image recognition, I needed to change tactics. A few months ago, Google made a TPU (tensor processing unit) available that is perfect for DIY projects. The one I'm using is the "USB Accelerator". It is sold under the "Coral" brand and is a small device that can be connected and powered via USB. Read more about the product [here](https://coral.withgoogle.com/products/accelerator).

The great thing about this device is, that you can connect it to your Raspberry Pi very easily and it provides amazing speed. The not-so-easy part was, that this TPU needs a specific type of model (they need to be fully quantized). And while google offers some conversion tools, you cannot currently create a quantized model from an existing model (that I could download from Azure CustomVision). So in the end I had to download the images from Azure (which is possible with their api - thanks!) and upload them to Google AutoML. There you can (of course) create a model that works on the Coral TPU.

Once the TPU was connected to the Raspberry Pi and the necessary libraries were installed, I created a little Python script (see below) that would listen to http calls from my node application and reply with the results of the image recognition. Now the whole process takes about **60ms** - which amazes me - and is hopefully quicker than my cat will ever be. Currently, I still got some false positives, as I had to retrain the model for the new camera perspective. But I hope I'll have that worked out pretty soon.

This is the python script that calls the TPU to do the image recognition - please note - I'm a complete python newbie.

```python
import os
import io
import time
import numpy as np
import jsonpickle
from PIL import Image
from flask import Flask, request, Response

import edgetpu.classification.engine

# Initialize the Flask application
app = Flask(__name__)

# initialize ai
model = './edgemodel/models_edge_ICN7519559552275459553_2019-08-15_18-34-56-018_edgetpu-tflite_edgetpu_model.tflite'
labels = './edgemodel/models_edge_ICN7519559552275459553_2019-08-15_18-34-56-018_edgetpu-tflite_dict.txt'

with open(labels, 'r') as f:
	pairs = (l.strip().split(maxsplit=1) for l in f.readlines())
	labels = dict((int(k), v) for k, v in pairs)

engine = edgetpu.classification.engine.ClassificationEngine(model)
_, width, height, channels = engine.get_input_tensor_shape()

imageWidth = 640
imageHeight = 480

# route http posts to this method
@app.route('/api/image', methods=['POST'])
def image():
	largeImage = Image.open(request.data)
	smallImage = largeImage.resize((width, height))
	
	results = engine.ClassifyWithInputTensor(np.array(smallImage).reshape(width*height*3), top_k=3)
	
	catValue = 0
	mouseValue = 0
	for result in results:
		if labels[result[0]] == "cat":
			catValue = result[1]
		if labels[result[0]] == "mouse":
			mouseValue = result[1]
	
	# build a response dict to send back to client
	response = {'tags': {'mouse': float(mouseValue), 'cat': float(catValue)}}
	
	# encode response using jsonpickle
	response_pickled = jsonpickle.encode(response)

	return Response(response=response_pickled, status=200, mimetype="application/json")

# start flask app
app.run(host="0.0.0.0", port=5000)
```
