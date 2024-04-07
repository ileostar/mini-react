import React from 'mini-react'

export default {
  createRoot(container) {
    return {
      render(el) {
        React.render(el, container)
      }
    }
  }
}
