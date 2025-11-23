import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'
import confetti from 'canvas-confetti'

export default class extends Controller {
  static targets = ["checkbox", "checkIcon", "title"]
  static values = {
    id: String,
    completed: Boolean,
    isExtra: Boolean
  }

  connect() {
    this.updateUI()
    this.setupClaimListener()
  }

  disconnect() {
    this.removeClaimListener()
  }

  setupClaimListener() {
    this.claimHandler = (event) => {
      if (event.detail.choreId === this.idValue) {
        this.performToggle(event.detail.userId)
      }
    }
    window.addEventListener('app:claim-confirmed', this.claimHandler)
  }

  removeClaimListener() {
    window.removeEventListener('app:claim-confirmed', this.claimHandler)
  }

  toggle(event) {
    if (this.shouldRequestClaim()) {
      event.preventDefault()
      this.requestClaim()
      return
    }

    this.performToggle()
  }

  shouldRequestClaim() {
    return this.isExtraValue && !this.completedValue
  }

  requestClaim() {
    window.dispatchEvent(new CustomEvent('app:request-claim', {
      detail: { choreId: this.idValue }
    }))
  }

  performToggle(userId = null) {
    const chore = StorageService.toggleChore(this.idValue, userId)
    if (chore) {
      const today = StorageService.getCurrentDateString()
      this.completedValue = chore.lastCompletedAt === today

      if (this.completedValue) {
        this.celebrate()
      }

      window.dispatchEvent(new CustomEvent('board:refresh'))
    }
  }

  completedValueChanged() {
    this.updateUI()
  }

  updateUI() {
    if (this.completedValue) {
      this.renderCompletedState()
    } else {
      this.renderIncompleteState()
    }
  }

  renderCompletedState() {
    this.checkboxTarget.classList.add('bg-green-500', 'border-green-500')
    this.checkboxTarget.classList.remove('border-gray-200')
    if (this.hasCheckIconTarget) {
      this.checkIconTarget.classList.remove('scale-0')
    }
    this.titleTarget.classList.add('text-gray-400', 'line-through')
  }

  renderIncompleteState() {
    this.checkboxTarget.classList.remove('bg-green-500', 'border-green-500')
    this.checkboxTarget.classList.add('border-gray-200')
    if (this.hasCheckIconTarget) {
      this.checkIconTarget.classList.add('scale-0')
    }
    this.titleTarget.classList.remove('text-gray-400', 'line-through')
  }

  celebrate() {
    const rect = this.element.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { x, y },
      colors: ['#A7F3D0', '#FDE68A', '#C4B5FD', '#FCA5A5'],
      disableForReducedMotion: true
    })
  }
}
