import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ["board", "settings"]

  toggleSettings() {
    this.settingsTarget.classList.toggle('hidden')
    this.settingsTarget.classList.toggle('translate-y-full')

    if (this.isSettingsClosed()) {
      this.refreshBoard()
    } else {
      this.refreshSettings()
    }
  }

  isSettingsClosed() {
    return this.settingsTarget.classList.contains('hidden')
  }

  refreshBoard() {
    window.dispatchEvent(new CustomEvent('board:refresh'))
  }

  refreshSettings() {
    window.dispatchEvent(new CustomEvent('settings:refresh'))
  }
}
