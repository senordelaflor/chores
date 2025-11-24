import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ["board", "settings"]

  connect() {
    this.startDayCheck()
  }

  disconnect() {
    this.stopDayCheck()
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.checkDate()
    }
  }

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

  refreshApp() {
    this.refreshBoard()
    this.refreshSettings()
    this.animateRefreshButton()
  }

  animateRefreshButton() {
    const btn = this.element.querySelector('[data-action="app#refreshApp"]')
    if (!btn) return

    btn.classList.add('animate-spin')
    setTimeout(() => btn.classList.remove('animate-spin'), 500)
  }

  startDayCheck() {
    this.lastDate = new Date().toLocaleDateString()
    const ONE_MINUTE_IN_MS = 60000

    this.dayCheckInterval = setInterval(() => {
      this.checkDate()
    }, ONE_MINUTE_IN_MS)
  }

  checkDate() {
    const currentDate = new Date().toLocaleDateString()

    if (currentDate !== this.lastDate) {
      this.lastDate = currentDate
      this.refreshBoard()
      this.refreshSettings()
    }
  }

  stopDayCheck() {
    if (this.dayCheckInterval) {
      clearInterval(this.dayCheckInterval)
    }
  }
}
