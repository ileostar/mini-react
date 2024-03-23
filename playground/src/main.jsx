// v1
// const dom = document.createElement("div")
// dom.id = "app"
// document.querySelector("#root").append(dom)

// const textNode = document.createTextNode("")
// textNode.nodeValue = "hello world"
// dom.append(textNode)

// v2
import { ReactDOM } from '../../packages/react-dom/index.js'
import { App } from './App.jsx'

ReactDOM.createRoot(document.querySelector('#root')).render(App)
