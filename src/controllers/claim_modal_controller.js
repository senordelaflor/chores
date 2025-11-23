import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  static targets = ["userList"]

  connect() {
    window.addEventListener('app:request-claim', (event) => {
      this.currentChoreId = event.detail.choreId
      this.open()
    })
  }

  open() {
    const users = StorageService.getUsers()
    this.userListTarget.innerHTML = users.map(user => this.generateUserButtonHTML(user)).join('')
    this.showModal()
  }

  showModal() {
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
      this.currentChoreId = null
    }, 300)
  }

  generateUserButtonHTML(user) {
    return `
      <button
        data-action="click->claim-modal#selectUser"
        data-user-id="${user.id}"
        class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-purple-50 hover:ring-2 hover:ring-purple-500 transition-all group">
        <div class="w-12 h-12 rounded-full ${user.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          ${user.avatar}
        </div>
        <span class="font-medium text-gray-700 group-hover:text-purple-700">${user.name}</span>
      </button>
    `
  }

  selectUser(event) {
    const userId = event.currentTarget.dataset.userId
    if (this.currentChoreId && userId) {
      this.confirmClaim(userId)
      this.close()
    }
  }

  confirmClaim(userId) {
    window.dispatchEvent(new CustomEvent('app:claim-confirmed', {
      detail: {
        choreId: this.currentChoreId,
        userId: userId
      }
    }))
  }
}
