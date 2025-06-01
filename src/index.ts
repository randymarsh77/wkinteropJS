import { v4 as uuidv4 } from 'uuid';

type MessageKind = 'event' | 'request' | 'response';

interface Message {
	id: string;
	kind: MessageKind;
	route: string;
	content: any;
}

interface PendingRequest {
	message: Message;
	response?: any;
	resolve: (response: any) => void;
	reject: (error: any) => void;
	promise: Promise<any>;
}

declare global {
	interface Window {
		webkit?: {
			messageHandlers: {
				wkinterop: {
					postMessage: (message: Message) => void;
				};
			};
		};
		wkinterop?: {
			_data: {
				eventHandlers: Record<string, ((content: any) => void)[]>;
				requestHandlers: Record<string, (content: any) => Promise<any>>;
				pendingRequests: PendingRequest[];
			};
			_handleEvent: (message: Message) => void;
			_handleRequest: (message: Message) => void;
			_handleResponse: (message: Message) => void;
		};
	}
}

function getOrCreateWKInteropData() {
	const { eventHandlers, requestHandlers, pendingRequests } = window.wkinterop?._data || {
		eventHandlers: {},
		requestHandlers: {},
		pendingRequests: [],
	};
	if (!window.wkinterop) {
		window.wkinterop = {
			_data: {
				eventHandlers,
				requestHandlers,
				pendingRequests,
			},

			_handleEvent: (message: Message) => {
				const handlers = eventHandlers[message.route];
				for (let i = 0; i < handlers.length; i++) {
					handlers[i](message.content);
				}
			},

			_handleRequest: (message: Message) => {
				requestHandlers[message.route](message.content).then((response) => {
					window.webkit?.messageHandlers.wkinterop.postMessage({
						id: message.id,
						route: message.route,
						kind: 'response',
						content: response,
					});
				});
			},

			_handleResponse: (message: Message) => {
				const pending = pendingRequests.filter((x) => x.message.id === message.id)[0];
				pendingRequests.splice(pendingRequests.indexOf(pending), 1);
				pending.response = message.content;
				pending.resolve(message.content);
			},
		};
	}
	return { eventHandlers, requestHandlers, pendingRequests };
}

export function useInterop() {
	const { eventHandlers, requestHandlers, pendingRequests } = getOrCreateWKInteropData();
	return {
		registerEventHandler: function (route: string, handler: (content: any) => void): () => void {
			let handlers = eventHandlers[route];
			if (!handlers) {
				handlers = [];
				eventHandlers[route] = handlers;
			}
			handlers.push(handler);
			return () => {
				const index = handlers.indexOf(handler);
				if (index !== -1) {
					handlers.splice(index, 1);
				}
			};
		},

		registerRequestHandler: function (route: string, handler: (content: any) => Promise<any>) {
			requestHandlers[route] = handler;
			return () => {
				if (requestHandlers[route] === handler) {
					delete requestHandlers[route];
				}
			};
		},

		publish: function (route: string, content?: any) {
			const message: Message = {
				id: uuidv4(),
				kind: 'event',
				route,
				content,
			};
			window.webkit?.messageHandlers.wkinterop.postMessage(message);
		},

		request: function (route: string, content: any) {
			const message: Message = {
				id: uuidv4(),
				kind: 'request',
				route,
				content,
			};
			let resolve!: (value: unknown) => void;
			let reject!: (reason?: any) => void;
			const promise = new Promise((resolveFn, rejectFn) => {
				resolve = resolveFn;
				reject = rejectFn;
			});
			pendingRequests.push({
				message,
				resolve,
				reject,
				promise,
			});
			window.webkit?.messageHandlers.wkinterop.postMessage(message);
			return promise;
		},
	};
}

export function useInteropEventHandler(route: string, handler: (content: any) => void): () => void {
	const { registerEventHandler } = useInterop();
	return registerEventHandler(route, handler);
}

export function useInteropRequestHandler(
	route: string,
	handler: (content: any) => Promise<any>
): () => void {
	const { registerRequestHandler } = useInterop();
	return registerRequestHandler(route, handler);
}

// Export types for consumers
export type { Message, MessageKind };
