import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  static targets = ["name", "balance", "redeemTab", "addTab", "actionButton"]

  connect() {
    this.mode = 'redeem' // 'redeem' or 'add'
    window.addEventListener('app:request-redeem', (event) => {
      this.userId = event.detail.userId
      this.currentBalance = event.detail.balance
      this.open()
    })
  }

  open() {
    const user = StorageService.getUsers().find(u => u.id === this.userId)
    if (!user) return

    this.nameTarget.textContent = user.name
    this.balanceTarget.textContent = `${this.currentBalance}m`
    this.setMode({ currentTarget: { dataset: { mode: 'redeem' } } }) // Reset to redeem mode

    this.element.classList.remove('hidden')
    requestAnimationFrame(() => {
      this.element.classList.remove('opacity-0')
      this.element.querySelector('div').classList.remove('scale-90')
      this.element.querySelector('div').classList.add('scale-100')
    })
  }

  close() {
    this.element.classList.add('opacity-0')
    this.element.querySelector('div').classList.remove('scale-100')
    this.element.querySelector('div').classList.add('scale-90')

    setTimeout(() => {
      this.element.classList.add('hidden')
      this.userId = null
    }, 300)
  }

  setMode(event) {
    const mode = event.currentTarget.dataset.mode || 'redeem'
    this.mode = mode

    // Update Tabs
    if (mode === 'redeem') {
      this.redeemTabTarget.classList.add('bg-white', 'text-red-600', 'shadow-sm')
      this.redeemTabTarget.classList.remove('text-gray-500', 'hover:text-gray-700')

      this.addTabTarget.classList.remove('bg-white', 'text-green-600', 'shadow-sm')
      this.addTabTarget.classList.add('text-gray-500', 'hover:text-gray-700')
    } else {
      this.addTabTarget.classList.add('bg-white', 'text-green-600', 'shadow-sm')
      this.addTabTarget.classList.remove('text-gray-500', 'hover:text-gray-700')

      this.redeemTabTarget.classList.remove('bg-white', 'text-red-600', 'shadow-sm')
      this.redeemTabTarget.classList.add('text-gray-500', 'hover:text-gray-700')
    }

    // Update Buttons
    this.actionButtonTargets.forEach(btn => {
      if (mode === 'redeem') {
        btn.classList.add('hover:bg-red-50', 'hover:text-red-600', 'hover:ring-red-200')
        btn.classList.remove('hover:bg-green-50', 'hover:text-green-600', 'hover:ring-green-200')
        btn.querySelector('span.font-bold').textContent = `-${btn.dataset.minutes}m`
      } else {
        btn.classList.add('hover:bg-green-50', 'hover:text-green-600', 'hover:ring-green-200')
        btn.classList.remove('hover:bg-red-50', 'hover:text-red-600', 'hover:ring-red-200')
        btn.querySelector('span.font-bold').textContent = `+${btn.dataset.minutes}m`
      }
    })
  }

  updateTime(event) {
    const minutes = parseInt(event.currentTarget.dataset.minutes)
    if (this.userId) {
      // If redeeming, we add to 'redeemedMinutes' (positive value).
      // If adding bonus, we subtract from 'redeemedMinutes' (negative value).
      const adjustment = this.mode === 'redeem' ? minutes : -minutes
      StorageService.redeemMinutes(this.userId, adjustment)
      window.dispatchEvent(new CustomEvent('board:refresh'))
      this.close()
    }
  }
}
