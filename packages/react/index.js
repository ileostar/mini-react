export const React = {
  createElement(type, config, ...children) {
    return {
      type,
      props: {
        ...config,
        children: children.map(child => typeof child === 'string' ? this.createTextNode(child) : child)
      }
    }
  },
  createTextNode(text) {
    return {
      type: 'TEXT_ELEMENT',
      props: {
        nodeValue: text,
        children: []
      }
    }
  }
}

export function render(el, container) {
  const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode(el.props.nodeValue) : document.createElement(el.type)

  Object.keys(el.props).forEach(key => {
    if (key !== 'children') {
      dom[key] = el.props[key]
    }
  });

  el.props?.children.forEach(child => render(child, dom))

  container?.append(dom)
}
