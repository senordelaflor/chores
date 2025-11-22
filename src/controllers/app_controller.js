import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ["board", "settings"]

  connect() {
    // Check if we have users, if not, show settings?
    // For now, just default to board.
  }

  toggleSettings() {
    this.settingsTarget.classList.toggle('hidden')
    this.settingsTarget.classList.toggle('translate-y-full')

    // Refresh board when closing settings
    if (this.settingsTarget.classList.contains('hidden')) {
      const event = new CustomEvent('board:refresh')
      window.dispatchEvent(event)
    } else {
        // Refresh settings when opening
        const event = new CustomEvent('settings:refresh')
        window.dispatchEvent(event)
    }
  }
}
