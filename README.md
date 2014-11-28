# PocketViz

A tool for visualizing reading data fron a user's [Pocket app](http://www.getpocket.com).

## Demo

Use a demo at http://play.fm.to.it/pocketviz

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

### Build

### Deploy

Upload the contents of the ```dist``` folder to your server and access it through your browser.

## Licence

PocketViz is free software licenced under the [GNU GPL](https://www.gnu.org/licenses/gpl.html) licence.
