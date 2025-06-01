---
title: Use AI to Keep Mice out of the House
slug: use-ai-to-keep-mice-out-of-the-house
publishDate: 20 Jun 2018
description: My pet cat is bringing home prey and making a mess. I used AI and Microsoft's CustomVision API to decide weather my cat should be let into the house or not.
---

![RaspberryPI with NOIR Camera](/assets/blog/casual-life-3d-workspace.webp)

This blog is about my pet-project (literally) of the last half year. I have a cat - Mio - which was quite lazy when it comes to hunting mice. In the 4 years before last summer he brought home maybe 10 mice. Last summer I moved to a place right next to a large field. As soon as Mio was allowed to use his new cat-door and go to explore his new home, he started hunting. And the thing with most cats that hunt is, that they bring their prey home. There are different theories why they would do that - either to show us humans what they hunted - or just to eat the mice in peace.

Anyway - Mio brought about 3 mice per night and choose to wake us every time. While waking up was bad enough - we also had to clean up the blood and the gall bladder.

After about two weeks it was clear that we had to do something - and as I had just read about [Microsoft's Custom Vision](https://www.customvision.ai/) and I was looking for a useful Raspberry PI project for a while, I decided to use the two tools to make sure I could sleep again.

The first step was to make sure the Raspi could see the cat coming in - also during the night.

## Reacting on Motion

The next step was to make sure the Raspi would take images when Mio came home (or a bit simpler - everytime something moved). For that I used the [Motion library](https://motion-project.github.io/) which I installed as a service on my Raspi. I configured it to save the images into a folder. There is a possibility to directly execute a command when a new image is taken - but as I wanted to use node for all the processing and starting node is much too slow, I kept it just saving the files and used a file watcher within node to react on new images.

**Speed is everything when competing with a cat**

During the performance tuning (see further down) I found the following important points:

* Use relatively low resolution images (I used 640x480) - larger images make everything slower but don't really help to recognize things  
* Take about 6 images per second (framerate setting in motion) - more is too much for the Raspi but with less you loose too much time  
* Use fs.watch in node - its about 10 times faster than any other watcher function I tested  
* Optimize other motion settings to your liking - but do not use too many "automatic adjustments" - they need too much CPU  

The following code was all that was needed to be able to check any movement visible in the camera:

```javascript
const fs = require('fs');
fs.watch(config.imageDir, { recursive: false }, function(evt, name) {
  name = `${config.imageDir}/${name}`;
  if (evt == 'change') {
    console.log(`${name}: check image`);
  }
});
```

## Recognize Mice

The next part - and the one that everyone told me would never work - was actually pretty simple. All that was needed was Mio bringing lots of mice to generate enough photos to learn from - and some cooperation from the people at CustomVision - thanks again!

First I collected all the picture the camera took and sorted them by "cat with mouse" and "cat without mouse" - I uploaded them to CustomVision and tagged them (I ended up having 4 tags: cat, nocat, mouse, nomouse).

After the first few hundred images, I finally had time to connect the service directly - and then noticed that I can tag all images that are uploaded in their interface - much nicer then the sorting & uploading. For the connection to the service I created a separate [npm module](https://www.npmjs.com/package/customvision-api) that you can use to upload images and get the predictions back.

I used the predictions to decide if the door should be closed (at this moment I just sent a mail with the image and a note that the door should have been closed. The "logic" to decide if I was certain enough to close the door is pretty simple: `catValue > 0.8 && mouseValue > 0.5 && mouseValue > noMouseValue`

## Close the Door

Closing the door seemed to be the easiest thing to do. But - I still had to learn something new - how to work with servos. I bought the cheapest servo I could find (a "Makeblock 9g Micro Servo") and used double-faced adhesive tape to stick it onto the door in a way, that the moving element could block the door. I then tried to get the thing moving.

If you have not used servos - read this to learn more: [Wikipedia: Servo Control](https://en.wikipedia.org/wiki/Servo_control). In short - it is a very strange way to control something - at least for people used to digital controls. But of course there are NPM packages to hide the complexity. I used [pi-fast-gpio](https://www.npmjs.com/package/pi-fast-gpio) which itself needs [pixgpio](http://abyz.co.uk/rpi/pigpio/index.html) to be installed. With that it was as simple as this:

```javascript
const gpio = new piFastGpio();
gpio.connect("127.0.0.1", "8888", function(err) {
  if (err) throw err;
  gpioReady = true;

  // make sure we close the connection when the script ends
  process.on('exit', code => {
    gpio.setServoPulsewidth(17, 0); // servo off
    gpio.setServoPulsewidth(servo2GPIO, 0); // servo off
    gpio.close();
    logger.info('closed connection to gpio');
    process.exit(code);
  });

  // Catch CTRL+C
  process.on('SIGINT', () => { process.exit(0); });

  // Catch uncaught exception
  process.on('uncaughtException', err => { logger.error(`uncaught exception: ${err}`); process.exit(1); });
});

function moveServo(pulseWith, keepMotorRunning) {
  clearInterval(gpioInterval);
  clearTimeout(gpioStopTimeout);
  gpioInterval = setInterval(function() {
    gpio.setServoPulsewidth(17, pulseWith);
  }, 20);
  if (!keepMotorRunning) {
    gpioStopTimeout = setTimeout(function() {
      gpio.setServoPulsewidth(17, 0);
      clearInterval(gpioInterval);
    }, 500)
  }
}

function closeDoor() {
  clearTimeout(reopenTimeout);
  reopenTimeout = setTimeout(function() {
    openDoor();
  }, keepDoorClosedFor);
  moveServo(1200, true); // true let's the motor running - to have more power
}

function openDoor() {
  clearTimeout(reopenTimeout);
  moveServo(500);
}
```

This worked pretty well - but - cats are stronger than I thought!

After that I bought a second servo - this did only help partially - the next step now is to install a much stronger servo - I hope this will solve the issue once and for all!

---

*Originally published on [dev2.viu.ch](https://dev2.viu.ch/blog/2018/use-ai-to-keep-mice-out-of-the-house.html) on June 20, 2018*
