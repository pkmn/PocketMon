/** @license MIT modified from Vadim Demedes's https://github.com/vadimdemedes/dom-chef */
type Attributes = JSX.IntrinsicElements['div'];
type DocumentFragmentConstructor = typeof DocumentFragment;
type ElementFunction = (props?: any) => HTMLElement;

declare global {
  namespace JSX {
    interface Element extends HTMLElement, DocumentFragment {
      addEventListener: HTMLElement['addEventListener'];
      removeEventListener: HTMLElement['removeEventListener'];
      className: HTMLElement['className'];
    }
  }
}

interface JSXElementClassDocumentFragment extends DocumentFragment, JSX.ElementClass { }
interface Fragment {
  prototype: JSXElementClassDocumentFragment;
  new(): JSXElementClassDocumentFragment;
}

// https://github.com/preactjs/preact/blob/1bbd687c/src/constants.js#L3
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

const isFragment = (type: DocumentFragmentConstructor | ElementFunction):
  type is DocumentFragmentConstructor => type === DocumentFragment;

const setCSSProps = (element: HTMLElement, style: CSSStyleDeclaration) => {
  for (const [name, value] of Object.entries(style)) {
    if (name.startsWith('-')) {
      element.style.setProperty(name, value);
    } else if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
      element.style[name as any] = `${value as string}px`;
    } else {
      element.style[name as any] = value;
    }
  }
};

const setAttribute = (element: HTMLElement, name: string, value: string) => {
  if (value !== undefined && value !== null) element.setAttribute(name, value);
};

const addChildren = (parent: Element | DocumentFragment, children: Node[]) => {
  for (const child of children) {
    if (child instanceof Node) {
      parent.appendChild(child);
    } else if (Array.isArray(child)) {
      addChildren(parent, child);
    } else if (typeof child !== 'boolean' && typeof child !== 'undefined' && child !== null) {
      parent.appendChild(document.createTextNode(child));
    }
  }
};

// https://github.com/facebook/react/blob/3f899089/packages/react-dom/src/shared/DOMProperty.js#L288-L322
const FALSIFIABLE_ATTRIBUTES = ['contentEditable', 'draggable', 'spellCheck', 'value'];

export const h = (
  type: DocumentFragmentConstructor | ElementFunction | string,
  attributes?: Attributes,
  ...children: Node[]
) => {
  if (typeof type !== 'string') {
    const element = isFragment(type) ? document.createDocumentFragment() : type(attributes);
    addChildren(element, children);
    return element;
  }

  const element = document.createElement(type);
  addChildren(element, children);
  if (!attributes) return element;

  for (let [name, value] of Object.entries(attributes)) {
    if (name === 'htmlFor') name = 'for';

    if (name === 'class' || name === 'className') {
      const existingClassname = element.getAttribute('class') ?? '';
      setAttribute(element, 'class', (existingClassname + ' ' + String(value)).trim());
    } else if (name === 'style') {
      setCSSProps(element, value);
    } else if (name.startsWith('on')) {
      const eventName = name.slice(2).toLowerCase().replace(/^-/, '');
      element.addEventListener(eventName, value);
    } else if (name === 'dangerouslySetInnerHTML' && '__html' in value) {
      element.innerHTML = value.__html;
    } else if (name !== 'key' && (FALSIFIABLE_ATTRIBUTES.includes(name) || value !== false)) {
      setAttribute(element, name, value === true ? '' : value);
    }
  }

  return element;
};

export const Fragment =
  (typeof DocumentFragment === 'function' ? DocumentFragment : () => {}) as Fragment;
