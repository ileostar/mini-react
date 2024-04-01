import React from '../react/index.js'

export default {
  createRoot(container) {
    return {
      render(el) {
        React.render(el, container)
      }
    }
  }
}
