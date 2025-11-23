import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  static targets = ["modalCard", "form", "nameInput", "avatarContainer"]

  connect() {
    window.addEventListener('app:edit-user', (event) => {
      this.userId = event.detail.userId
      this.open()
    })
  }

  open() {
    const user = StorageService.getUsers().find(u => u.id === this.userId)
    if (!user) return

    this.nameInputTarget.value = user.name
    this.renderAvatarSelection(user.avatar)

    this.element.classList.remove('hidden')

    // Force reflow
    void this.element.offsetWidth

    this.element.classList.remove('opacity-0')
    this.modalCardTarget.classList.remove('scale-90')
    this.modalCardTarget.classList.add('scale-100')
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

  renderAvatarSelection(currentAvatar) {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐝', '🐞']

    this.avatarContainerTarget.innerHTML = emojis.map(emoji => `
      <label class="cursor-pointer">
        <input type="radio" name="avatar" value="${emoji}" class="peer sr-only" ${emoji === currentAvatar ? 'checked' : ''}>
        <div class="w-10 h-10 flex items-center justify-center text-2xl rounded-full hover:bg-gray-100 peer-checked:bg-purple-100 peer-checked:ring-2 peer-checked:ring-purple-500 transition-all">
          ${emoji}
        </div>
      </label>
    `).join('')
  }

  save(event) {
    event.preventDefault()
    const name = this.nameInputTarget.value.trim()
    const avatar = this.formTarget.querySelector('input[name="avatar"]:checked').value

    if (name && this.userId) {
      StorageService.updateUser(this.userId, { name, avatar })
      window.dispatchEvent(new CustomEvent('settings:refresh'))
      window.dispatchEvent(new CustomEvent('board:refresh'))
      this.close()
    }
  }
}
