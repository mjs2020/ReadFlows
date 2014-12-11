# PocketViz

A tool for visualizing reading data fron a user's [Pocket app](http://www.getpocket.com).

## Demo

Use a demo at (currently not public)

## Installation

The visualization runs entirely in the client browser. However the Pocket API does not support
[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) which means that it cannot 
be queried directly from Javascript. Therefore there is PHP proxy to handle these requests.

If you want to install this on your own server you will need a web host with PHP.

To build the frontend you'll also need [Grunt](http://gruntjs.com) and [Bower](http://bower.io)
installed.

### Get the source

Download the source from the link on the right or git clone it to your computer.
```bash
git clone https://github.com/mjs2020/pocketviz
```

### Get the dependencies

Install the node modue dependencies
```bash
npm install
bower install
```

### Configure
You will need to create an app in Pocket to get an API key and run this on your own server.

1. Log in to pocket: http://getpocket.com/login
2. Go to http://getpocket.com/developer/apps/new create an app. The app needs "retrieve" permission.
3. Get the consumer key for your new app.
4. Edit the file ```app/config.php``` in your favourite text editor, add the consumer key and the URL to the callback.html file on your own server.

### Build

To build the app run:
```bash
grunt build
```
It will create a ```dist``` subfolder.

### Deploy

Upload the contents of the ```dist``` folder to your server and access it through your browser.

## Licence

PocketViz is free software licenced under the [GNU GPL](https://www.gnu.org/licenses/gpl.html) licence.

## Credits
Checkout the [CREDITS.md](CREDITS.md) file