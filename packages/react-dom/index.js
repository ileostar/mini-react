import { render } from '../react/index.js'

export const ReactDOM = {
  createRoot(container) {
    return {
      render(el) {
        render(el, container)
      }
    }
  }
}
