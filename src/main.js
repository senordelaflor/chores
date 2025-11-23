import './style.css'
import { Application } from '@hotwired/stimulus'
import EditUserModalController from './controllers/edit_user_modal_controller'

window.Stimulus = Application.start()
Stimulus.register("edit-user-modal", EditUserModalController)

// Load all controllers in the ./controllers directory
const controllers = import.meta.glob('./controllers/*_controller.js', { eager: true })

Object.entries(controllers).forEach(([path, module]) => {
  const controllerName = path
    .replace('./controllers/', '')
    .replace('_controller.js', '')
    .replace(/_/g, '-')

  if (controllerName !== 'edit-user-modal') {
    window.Stimulus.register(controllerName, module.default)
  }
})
