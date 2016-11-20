import { autobind } from 'core-decorators';
import uuid from 'uuid';

@autobind
export default class WKInterop
{
	static Install = () => {
		window.wkinterop = new WKInterop();
		return window.wkinterop;
	}

	constructor() {
		this.eventHandlers = {};
		this.requestHandlers = {};
		this.pendingRequests = [];
	}

	registerEventHandler = (route, handler) => {
		let handlers = this.eventHandlers[route];
		if (!handlers) {
			handlers = [];
			this.eventHandlers[route] = handlers;
		}
		handlers.push(handler);
	}

	registerRequestHandler = (route, handler) => {
		this.requestHandlers[route] = handler;
	}

	publish = (route, content) => {
		const message = {
			id: uuid(),
			kind: 'event',
			route,
			content,
		};
		window.webkit.messageHandlers.wkinterop.postMessage(message);
	}

	request = (route, content) => {
		const message = {
			id: uuid(),
			kind: 'request',
			route,
			content,
		};
		const request = {
			message,
		};
		const promise = new Promise((resolve, reject) => {
			request.resolve = resolve;
			request.reject = reject;
		});
		request.promise = promise;
		this.pendingRequests.push(request);
		window.webkit.messageHandlers.wkinterop.postMessage(message);
		return promise;
	}

	_handleEvent = (message) => {
		const handlers = this.eventHandlers[message.route];
		for (let i = 0; i < handlers.length; i++) {
			handlers[i](message.content);
		}
	}

	_handleRequest = (message) => {
		this.requestHandlers[message.route](message.content)
			.then((response) => {
				window.webkit.messageHandlers.wkinterop.postMessage({
					id: message.id,
					route: message.route,
					kind: 'response',
					content: response,
				});
			});
	}

	_handleResponse = (message) => {
		const pending = this.pendingRequests.filter(x => x.message.id === message.id)[0];
		pending.response = message.content;
		pending.resolve(message.content);
	}
}
