import './style.css'
import { Application } from '@hotwired/stimulus'
import { registerSW } from 'virtual:pwa-register'
import EditUserModalController from './controllers/edit_user_modal_controller'

let swRegistration = null

const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content available, click reload button to update.")
  },
  onOfflineReady() {
    console.log("App ready to work offline")
  },
  onRegistered(r) {
    swRegistration = r
  }
})

window.forceAppUpdate = async () => {
  if (swRegistration) {
    await swRegistration.update()
  }
  updateSW(true)
}

// Safety check: Reload page when new SW takes control to prevent lazy-loading errors
let refreshing = false
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (refreshing) return
  refreshing = true
  window.location.reload()
})

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
