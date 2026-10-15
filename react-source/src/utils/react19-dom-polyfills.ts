/**
 * React 19 removed several react-dom APIs that vendored UI still relies on.
 * Apply once at app/test startup so CSSTransition does not crash when findDOMNode is missing.
 */
import * as ReactDOM from 'react-dom';
import ReactDOMDefault from 'react-dom';

type Findable = Element | Text | null | undefined;

function findDOMNodePolyfill(node: Findable | object): Element | Text | null {
    if (node == null) return null;
    if (node instanceof Element || node instanceof Text) return node;
    return null;
}

export function applyReact19DomPolyfills(): void {
    const targets = [ReactDOM, ReactDOMDefault] as Array<
        typeof ReactDOM & { findDOMNode?: typeof findDOMNodePolyfill; default?: { findDOMNode?: typeof findDOMNodePolyfill } }
    >;
    for (const target of targets) {
        if (!target) continue;
        if (typeof target.findDOMNode !== 'function') {
            try { target.findDOMNode = findDOMNodePolyfill; } catch { /* Frozen ESM namespace. */ }
        }
        if (target.default && typeof target.default.findDOMNode !== 'function') {
            try { target.default.findDOMNode = findDOMNodePolyfill; } catch { /* Frozen ESM namespace. */ }
        }
    }
}
