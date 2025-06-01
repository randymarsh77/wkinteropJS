# wkinteropJS
JS counterpart to [wkinterop](https://github.com/randymarsh77/wkinterop), a Swift package for talking to `WKWebViews`. Install with `npm install wkinterop`.

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![codebeat badge](https://codebeat.co/badges/f52f1cb5-6a61-4490-b59f-e4cc57f7f2a7)](https://codebeat.co/projects/github-com-randymarsh77-wkinteropjs)

## Overview

`WKWebView` provides an api for executing JS code, and receiving messages from JS running in the view's execution environment. However, any nontrivial amount of communication requires boiler plate interop code. Then, there are other considerations like asynchronicity and cancellation.

`WKInterop` facilitates communication by providing an api to both Swift code, and JS code for publishing events and making asynchronous requests. Each execution environment can register to receive events and process requests.

## Usage

Given that we are in the context of a WKWebView created using `WKInterop` (see [Swift Example](https://github.com/randymarsh77/wkinterop#example)), you can import and use the interop functions:

```javascript
import { useInterop } from 'wkinterop';

const { registerEventHandler, registerRequestHandler, publish, request } = useInterop();
```

Or use the individual hook functions:

```javascript
import { useInteropEventHandler, useInteropRequestHandler, useInterop } from 'wkinterop';
```

Available functions:
- `registerEventHandler(route, handler)` - Register a handler for events from Swift
- `registerRequestHandler(route, handler)` - Register a handler for requests from Swift  
- `publish(route, content)` - Publish an event to Swift
- `request(route, content)` - Make a request to Swift (returns a Promise)

Requests are promise-based, so a handler should return a promise that fulfills the request and making a request will return a promise.

All communications can provide a value as an argument and choose to handle or ignore an argument that has been provided. Requests must return a value.

Handler registration functions return an unsubscribe function that can be called to remove the handler.

## Example

```javascript
import { useInterop, useInteropEventHandler, useInteropRequestHandler } from 'wkinterop';

const { publish, request } = useInterop();

// Register event handler using the hook
const unsubscribeEvent = useInteropEventHandler('example.route.swift-published-event', (data) => {
  console.log('This is the event published by Swift provided with some argument/data/context what have you: ', data);
});

// Register request handler using the hook
const unsubscribeRequest = useInteropRequestHandler('example.route.swift-initiated-request', (request) => {
  console.log('This is the request argument: ', request);
  return Promise.resolve({ prop: 'this is my response' });
});

// Or register handlers using the main useInterop hook
const { registerEventHandler, registerRequestHandler } = useInterop();

const removeEventHandler = registerEventHandler('another.event.route', (data) => {
  console.log('Another event handler:', data);
});

const removeRequestHandler = registerRequestHandler('another.request.route', async (request) => {
  return { result: 'processed request' };
});

// Publish an event to Swift
publish('example.route.js-published-event', {
  prop: 'providing some context',
});

// Make a request to Swift
request('example.route.js-initiated-request', { prop: 'JS is requesting data from Swift' })
  .then((response) => {
    console.log('received this response from Swift: ', response);
  });

// Clean up handlers when needed
// unsubscribeEvent();
// unsubscribeRequest();
// removeEventHandler();
// removeRequestHandler();
```