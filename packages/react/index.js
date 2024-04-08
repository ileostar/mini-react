/** 创建文本节点 */
function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/** 创建虚拟dom */
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

/** 整个渲染过程的根 Fiber 节点 */
let wipRoot = null
/** 单元工作：处理一个真实dom根节点 */
let currentRoot = null;
/** 下一个工作单元 */
let nextWorkOfUnit = null;
/** 要删除的节点 */
let deletions = [];
/** 当前正在渲染的fiber */
let wipFiber = null;

/** 渲染函数 */
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
  while (deadline.timeRemaining() > 1 && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined
    }
  }
  if (!nextWorkOfUnit && wipRoot) {
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
/** 统一删除节点 */
function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }
    fiberParent.dom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child)
  }
}
/** 统一提交节点 */
function commitWork(fiber) {
  if (!fiber) return

  // 忽略空的function组件
  let fiberParent = fiber.parent
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  switch (fiber.effectTag) {
    case "UPDATE":
      updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
      break
    case "PLACEMENT":
      if (fiber.dom) {
        fiberParent.dom.append(fiber.dom)
      }
      break
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

/** 创建真实dom */
function createDom(type, props) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode(props.nodeValue ? props.nodeValue : '')
    : document.createElement(type)
}

/** 处理Props */
function updateProps(dom, nextProps, prevProps = {}) {
  // 1. old 有  new 没有 删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });

  // 2. new 有 old 没有 添加
  // 3. new 有 old 有 修改
  Object.keys(nextProps).forEach((key) => {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
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

/** 处理子节点 */
function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
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
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          effectTag: "PLACEMENT",
          dom: null
        }
      }

      if (oldFiber)
        deletions.push(oldFiber)
    }

    if (oldFiber)
      oldFiber = oldFiber.sibling;

    if (index === 0)
      fiber.child = newFiber;
    else
      prevChild.sibling = newFiber;

    if (newFiber) prevChild = newFiber
  })
  while (oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

/** 处理函数组件 */
function updateFunctionComponent(fiber) {
  stateHooks = [];
  stateHookIndex = 0;
  wipFiber = fiber;
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

/** 处理默认组件 */
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type, fiber.props))
    updateProps(dom, fiber.props)
  }
  const children = fiber.props.children
  reconcileChildren(fiber, children)
}

/** 单元工作：处理一个单个dom节点 */
function performWorkOfUnit(fiber) {
  const isFunctionComponent = fiber.type instanceof Function

  isFunctionComponent
    ? updateFunctionComponent(fiber)
    : updateHostComponent(fiber)

  // 返回下一个工作单元
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling)
      return nextFiber.sibling

    // 回到父级
    nextFiber = nextFiber.parent
  }
}

/** 更新 */
function update() {
  let currentFiber = wipFiber
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextWorkOfUnit = wipRoot;
  }
}

let stateHooks;
let stateHookIndex;

/**
 * useState
 * @description 管理状态
 * @param {*} initial
 * @example
 * const [state, setState] = useState(0)
 * const [state, setState] = useState(() => 0)
 */
export function useState(initial) {
  let currentFiber = wipFiber;
  const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  };

  stateHook.queue.forEach((action) => {
    if (typeof action === "function") {
      stateHook.state = action(stateHook.state);
    } else {
      stateHook.state = action
    }
  });

  stateHook.queue = [];

  stateHookIndex++;
  stateHooks.push(stateHook);

  currentFiber.stateHooks = stateHooks;

  function setState(action) {
    const edgerState = typeof action === "function" ? action(stateHook.state) : action
    if (edgerState === stateHook.state) return

    stateHook.queue.push(action);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextWorkOfUnit = wipRoot;
  }

  return [stateHook.state, setState];
}

const React = {
  update,
  useState,
  render,
  createElement
}

export default React
