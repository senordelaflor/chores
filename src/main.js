import './style.css'
import { Application } from '@hotwired/stimulus'


window.Stimulus = Application.start()

// Load all controllers in the ./controllers directory
// Since we are using Vite, we can use import.meta.glob
const controllers = import.meta.glob('./controllers/*_controller.js', { eager: true })

Object.entries(controllers).forEach(([path, module]) => {
  const controllerName = path
    .replace('./controllers/', '')
    .replace('_controller.js', '')
    .replace(/_/g, '-')

  window.Stimulus.register(controllerName, module.default)
})
