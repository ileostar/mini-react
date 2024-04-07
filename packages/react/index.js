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

let wipRoot =null
let currentRoot = null;
let nextWorkOfUnit = null;
let deletions = [];
let wipFiber = null;
function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };

  nextWorkOfUnit = wipRoot;
}

/** 任务调度器 */
function workerLoop(deadline) {
  while(deadline.timeRemaining() > 1 && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
  }
  if(!nextWorkOfUnit && wipRoot){
    commitRoot()
  }

  requestIdleCallback(workerLoop)
}
requestIdleCallback(workerLoop)

/** 统一提交 */
function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child)
  currentRoot = wipRoot

  // 重置
  wipRoot = null
  deletions = []
}
function commitDeletion(fiber) {
  if(fiber.dom) {
    let fiberParent = fiber.parent
    while(!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  }else{
    commitDeletion(fiber.child)
  }
}
function commitWork(fiber) {
  if(!fiber) return

  // 忽略空的function组件
  let fiberParent = fiber.parent
  while(!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  switch(fiber.effectTag) {
    case "UPDATE":
      updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
      break
    case "PLACEMENT":
      if(fiber.dom) {
        fiberParent.dom.append(fiber.dom)
      }
      break
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type, props) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode(props.nodeValue?props.nodeValue:'')
    : document.createElement(type)
}

/** 处理Props */
function updateProps (dom, nextProps, prevProps = {}) {
  // 1. old 有  new 没有 删除
  Object.keys(prevProps).forEach(key => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });

  // 2. new 有 old 没有 添加
  // 3. new 有 old 有 修改
  Object.keys(nextProps).forEach(key => {
    if (key !== 'children') {
      if(nextProps[key] !== prevProps[key]) {
        if(key.startsWith('on')) {
          const eventType = key.slice(2).toLowerCase();

          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
}

function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child,index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;

    let newFiber;
    if (isSameType) {
      // update
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        effectTag: "UPDATE",
        dom: oldFiber.dom,
        alternate: oldFiber
      }
    } else {
      // add
      if(child) {
        newFiber ={
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          effectTag: "PLACEMENT",
          dom: null
        }
      }

      if(oldFiber)
        deletions.push(oldFiber)
    }

    if (oldFiber)
      oldFiber = oldFiber.sibling;

    if (index === 0)
      fiber.child = newFiber;
    else
      prevChild.sibling = newFiber;

    if(newFiber) prevChild = newFiber
  })
  while (oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

function updateFunctionComponent(fiber) {
  console.log("functon component",fiber)
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) { 
  if(!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type, fiber.props))
    updateProps(dom, fiber.props)
  }
  const children = fiber.props.children
  reconcileChildren(fiber,children)
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
    if(nextFiber.sibling)
      return nextFiber.sibling

    // 回到父级
    nextFiber = nextFiber.parent
  }
}

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };

  nextWorkOfUnit = wipRoot;
}

const React = {
  update,
  render,
  createElement
}

export default React
