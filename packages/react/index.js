function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, config, ...children) {
  return {
    type,
    props: {
      ...config,
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
    }
  }
}
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
}

let nextWorkOfUnit = null
function workerLoop(deadline) {
  while(deadline.timeRemaining() > 1 && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
  }
  requestIdleCallback(workerLoop)
}
requestIdleCallback(workerLoop)

function createDom(type, props) {
  return type === 'TEXT_ELEMENT'
      ? document.createTextNode(props.nodeValue)
      : document.createElement(type)
}

function updateProps (dom, props) {
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key]
    }
  });
}

function initChindren(fiber) {
  const children = fiber.props.children
  let prevChild = null
  children.forEach((child,index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      sibling: null,
      dom: null
    }
    if(index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }
    prevChild = newFiber
  })
}
function performWorkOfUnit(fiber) {
  if(!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type, fiber.props))
    fiber.parent.dom.append(dom)
    updateProps(dom, fiber.props)
  }

  initChindren(fiber)

  if(fiber.child) {
    return fiber.child
  }
  if(fiber.sibling){
    return fiber.sibling
  }
  return fiber.parent?.sibling
}

const React = {
  render,
  createElement
}

export default React
