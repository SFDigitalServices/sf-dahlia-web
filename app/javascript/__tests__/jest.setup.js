// polyfill for TextEncoder
// https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
global.TextEncoder = require("util").TextEncoder

HTMLCanvasElement.prototype.getContext = jest.fn()

// jsdom does not implement ResizeObserver, which @dnd-kit/dom (pulled in by
// ui-components 14 tables) references at module load. Provide a no-op polyfill.
global.ResizeObserver =
  global.ResizeObserver ||
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

// React 19's react-dom/server (imported transitively by ui-components) relies on
// MessageChannel for scheduling, which jsdom does not provide. Node's worker_threads
// implementation keeps the event loop alive and hangs Jest on exit, so use a minimal
// setTimeout-based polyfill that satisfies React's scheduler (port2.postMessage
// dispatches to port1.onmessage) without holding open handles.
if (global.MessageChannel === undefined) {
  /** @param {() => void} cb */
  const scheduleMacrotask = (cb) => {
    setTimeout(cb, 0)
  }
  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = { onmessage: null, postMessage() {}, close() {}, start() {} }
      this.port2 = {
        onmessage: null,
        /** @param {unknown} data */
        postMessage: (data) => {
          scheduleMacrotask(() => {
            if (typeof this.port1.onmessage === "function") {
              this.port1.onmessage({ data })
            }
          })
        },
        close() {},
        start() {},
      }
    }
  }
}
