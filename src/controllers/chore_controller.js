import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'
import confetti from 'canvas-confetti'

export default class extends Controller {
  static targets = ["checkbox", "checkIcon", "title"]
  static values = {
    id: String,
    completed: Boolean
  }

  connect() {
    this.updateUI()
  }

  toggle() {
    const chore = StorageService.toggleChore(this.idValue)
    if (chore) {
      const today = new Date().toISOString().split('T')[0]
      this.completedValue = chore.lastCompletedAt === today

      if (this.completedValue) {
        this.celebrate()
      }

      // Notify board to refresh progress bars
      window.dispatchEvent(new CustomEvent('board:refresh'))
    }
  }

  completedValueChanged() {
    this.updateUI()
  }

  updateUI() {
    if (this.completedValue) {
      this.checkboxTarget.classList.add('bg-green-500', 'border-green-500')
      this.checkboxTarget.classList.remove('border-gray-200')
      this.checkIconTarget.classList.remove('scale-0')
      this.titleTarget.classList.add('text-gray-400', 'line-through')
    } else {
      this.checkboxTarget.classList.remove('bg-green-500', 'border-green-500')
      this.checkboxTarget.classList.add('border-gray-200')
      this.checkIconTarget.classList.add('scale-0')
      this.titleTarget.classList.remove('text-gray-400', 'line-through')
    }
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
