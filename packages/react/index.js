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
      children: children.map(child => {
        const isTextNode = typeof child === 'string' || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child
      })
    }
  }
}

let root =null
let nextWorkOfUnit = null
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
  root = nextWorkOfUnit
}

/** 任务调度器 */
function workerLoop(deadline) {
  while(deadline.timeRemaining() > 1 && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
  }
  if(!nextWorkOfUnit && root){
    commitRoot()
  }

  requestIdleCallback(workerLoop)
}
requestIdleCallback(workerLoop)

/** 统一提交 */
function commitRoot() {
  commitWork(root.child)
  root = null
}
function commitWork(fiber) {
  if(!fiber) return

  let fiberParent = fiber.parent

  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if(fiber.dom) {
    fiberParent.dom.append(fiber.dom)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

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

function initChindren(fiber, children) {
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

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  initChindren(fiber, children)
}

function updateHostComponent(fiber) { 
  if(!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type, fiber.props))
    updateProps(dom, fiber.props)
  }
  const children = fiber.props.children
  initChindren(fiber,children)
}

/** 单元工作：处理一个单个dom节点 */
function performWorkOfUnit(fiber) {
  const isFunctionComponent = fiber.type instanceof Function

  isFunctionComponent
    ? updateFunctionComponent(fiber)
    : updateHostComponent(fiber)

  // 返回下一个工作单元
  if(fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while(nextFiber) {
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

const React = {
  render,
  createElement
}

export default React
