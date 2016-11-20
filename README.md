# wkinteropJS
JS counterpart to [wkinterop](https://github.com/randymarsh77/wkinterop), a Swift package for talking to `WKWebViews`. Install with `npm install wkinterop`.

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

## Overview

`WKWebView` provides an api for executing JS code, and recieving messages from JS running in the view's execution environment. However, any nontrivial amount of communication requires boiler plate interop code. Then, there are other considerations like asynchronousity and cancellation.

`WKInterop` facilitates communication by providing an api to both Swift code, and JS code for publishing events and making asyncrhonous requests. Each execution environment can register to recieve events and process requests.

## Usage

Given that we are in the context of a WKWebView created using `WKInterop` (see [Swift Example](https://github.com/randymarsh77/wkinterop#example)), we can use:

- `registerEventHandler = (route, handler) => { ... }`
- `registerRequestHandler = (route, handler) => { ... }`
- `publish = (route, content) => { ... }`
- `request = (route, content) => { ... }`

Requests are promise-based, IE a handler should return a promise that fulfils the request and making a request will return a promise.

All communications can provide a value as an argument and choose to handle or ignore an argument that has been provided. Requests must return a value.

## Example

First, install `wkinterop` with something like:
```
import WKInterop from 'wkinterop';
...
const wkinterop = WKInterop.Install();
```
This is necessary to set up handler functions that Swift will assume exist. `Install` is a static function that creates an instance of `WKInterop` and installs it in the window, then returnsthe instance for consumption. Treat this instance as a singleton.

Then, carry on.
```
wkinterop.registerEventHandler('example.route.swift-published-event', (data) => {
  console.log('This is the event published by Swift provided with some argument/data/context what have you: ', data);
});

wkinterop.registerRequestHandler('example.route.swift-initiated-request', (request) => {
  console.log('This is the request argument: ', request);
  return Promise.resolve({ prop: 'this is my response' });
});

wkinterop.publish('example.route.js-published-event', {
  prop: 'providing some context',
});

wkinterop.request('example.route.js-initiated-request', { prop: 'JS is requesting data from Swift' })
  .then((response) => {
    console.log('recieved this response from Swift: ', response);
  });
```

## Why?

JS is the most cross platform accessible language. However, you might not want to write important business logic in it. You might not be able to. But, you can still ship a consistent UI to any desktop or mobile platform, and even all of the above together with maximal code sharing. If that's what you want to do, then a good framework for communication interop is a must. `WKInterop` is still in it's early stages, but it aims to be good for this use case.

Ok, so... cross platform, but... `WKWebView` and Swift? Alright, you got me. Platforms besides macOS and iOS would need a compatible reciever, and this library would need some additional abstraction and environment detection. The potential is there, but I'm starting out with some platform contraints.

## Roadmap <a name="roadmap"></a>

These are a few items I imagine I'll need to address in the near future.

- Needs cancellation support
- Built-in log forwarding might be nice
- Custom asset loading... what if your UI wants to specify a platform-agnostic asset url but the application context wants or needs to load that url differently based on platform?
