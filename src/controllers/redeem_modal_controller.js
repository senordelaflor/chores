import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  static targets = ["name", "balance", "redeemTab", "addTab", "actionButton", "modalCard"]

  connect() {
    this.mode = 'redeem'
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
    this.setMode({ currentTarget: { dataset: { mode: 'redeem' } } })

    this.showModal()
  }

  showModal() {
    this.element.classList.remove('hidden')
    requestAnimationFrame(() => {
      this.element.classList.remove('opacity-0')
      this.modalCardTarget.classList.remove('scale-90')
      this.modalCardTarget.classList.add('scale-100')
    })
  }

  close() {
    this.element.classList.add('opacity-0')
    this.modalCardTarget.classList.remove('scale-100')
    this.modalCardTarget.classList.add('scale-90')

    setTimeout(() => {
      this.element.classList.add('hidden')
      this.userId = null
    }, 300)
  }

  setMode(event) {
    const mode = event.currentTarget.dataset.mode || 'redeem'
    this.mode = mode

    if (mode === 'redeem') {
      this.activateRedeemMode()
    } else {
      this.activateAddMode()
    }
  }

  activateRedeemMode() {
    this.redeemTabTarget.classList.add('bg-white', 'text-red-600', 'shadow-sm')
    this.redeemTabTarget.classList.remove('text-gray-500', 'hover:text-gray-700')

    this.addTabTarget.classList.remove('bg-white', 'text-green-600', 'shadow-sm')
    this.addTabTarget.classList.add('text-gray-500', 'hover:text-gray-700')

    this.updateButtonsForRedeem()
  }

  activateAddMode() {
    this.addTabTarget.classList.add('bg-white', 'text-green-600', 'shadow-sm')
    this.addTabTarget.classList.remove('text-gray-500', 'hover:text-gray-700')

    this.redeemTabTarget.classList.remove('bg-white', 'text-red-600', 'shadow-sm')
    this.redeemTabTarget.classList.add('text-gray-500', 'hover:text-gray-700')

    this.updateButtonsForAdd()
  }

  updateButtonsForRedeem() {
    this.actionButtonTargets.forEach(btn => {
      btn.classList.add('hover:bg-red-50', 'hover:text-red-600', 'hover:ring-red-200')
      btn.classList.remove('hover:bg-green-50', 'hover:text-green-600', 'hover:ring-green-200')
      btn.querySelector('span.font-bold').textContent = `-${btn.dataset.minutes}m`
    })
  }

  updateButtonsForAdd() {
    this.actionButtonTargets.forEach(btn => {
      btn.classList.add('hover:bg-green-50', 'hover:text-green-600', 'hover:ring-green-200')
      btn.classList.remove('hover:bg-red-50', 'hover:text-red-600', 'hover:ring-red-200')
      btn.querySelector('span.font-bold').textContent = `+${btn.dataset.minutes}m`
    })
  }

  updateTime(event) {
    const minutes = parseInt(event.currentTarget.dataset.minutes)
    if (this.userId) {
      const adjustment = this.mode === 'redeem' ? minutes : -minutes
      StorageService.redeemMinutes(this.userId, adjustment)
      window.dispatchEvent(new CustomEvent('board:refresh'))
      this.close()
    }
  }
}
