import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  static targets = ["name", "balance", "redeemTab", "addTab", "input", "confirmButton", "modalCard"]

  connect() {
    this.mode = 'redeem'
    window.addEventListener('app:request-coin-redeem', (event) => {
      this.userId = event.detail.userId
      this.currentBalance = event.detail.balance
      this.open()
    })
  }

  open() {
    const user = StorageService.getUsers().find(u => u.id === this.userId)
    if (!user) return

    this.nameTarget.textContent = user.name
    this.balanceTarget.textContent = `${this.currentBalance}`
    this.inputTarget.value = ''
    this.setMode({ currentTarget: { dataset: { mode: 'redeem' } } })

    this.showModal()
  }

  showModal() {
    this.element.classList.remove('hidden')
    requestAnimationFrame(() => {
      this.element.classList.remove('opacity-0')
      this.modalCardTarget.classList.remove('scale-90')
      this.modalCardTarget.classList.add('scale-100')
      this.inputTarget.focus()
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
    this.redeemTabTarget.classList.add('bg-white', 'text-amber-600', 'shadow-sm')
    this.redeemTabTarget.classList.remove('text-gray-500', 'hover:text-gray-700')

    this.addTabTarget.classList.remove('bg-white', 'text-green-600', 'shadow-sm')
    this.addTabTarget.classList.add('text-gray-500', 'hover:text-gray-700')

    this.updateConfirmButton('Redeem Coins', 'bg-amber-500', 'hover:bg-amber-600', 'shadow-amber-200')
  }

  activateAddMode() {
    this.addTabTarget.classList.add('bg-white', 'text-green-600', 'shadow-sm')
    this.addTabTarget.classList.remove('text-gray-500', 'hover:text-gray-700')

    this.redeemTabTarget.classList.remove('bg-white', 'text-amber-600', 'shadow-sm')
    this.redeemTabTarget.classList.add('text-gray-500', 'hover:text-gray-700')

    this.updateConfirmButton('Add Bonus Coins', 'bg-green-500', 'hover:bg-green-600', 'shadow-green-200')
  }

  updateConfirmButton(text, bgClass, hoverClass, shadowClass) {
    this.confirmButtonTarget.textContent = text
    this.confirmButtonTarget.className = `w-full py-3 rounded-xl font-bold text-white transition-colors shadow-lg ${bgClass} ${hoverClass} ${shadowClass}`
  }

  submit(event) {
    event.preventDefault()
    const amount = parseInt(this.inputTarget.value)

    if (!amount || amount <= 0) return

    if (this.userId) {
      const adjustment = this.mode === 'redeem' ? amount : -amount
      StorageService.redeemCoins(this.userId, adjustment)
      window.dispatchEvent(new CustomEvent('board:refresh'))
      this.close()
    }
  }
}
