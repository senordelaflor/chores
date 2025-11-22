import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  static targets = ["userList", "userSelect", "choreList"]

  connect() {
    this.renderUsers()
    window.addEventListener('settings:refresh', () => this.renderUsers())
  }

  renderUsers() {
    const users = StorageService.getUsers()

    // Render User List
    this.userListTarget.innerHTML = users.map(user => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-xl">
            ${user.avatar}
          </div>
          <span class="font-medium text-gray-700">${user.name}</span>
        </div>
        <button data-action="click->settings#deleteUser" data-user-id="${user.id}" class="text-red-400 hover:text-red-600 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    `).join('')

    // Render User Select for Chores
    const currentSelect = this.userSelectTarget.value
    this.userSelectTarget.innerHTML = users.map(user => `
      <option value="${user.id}">${user.name}</option>
    `).join('')

    if (users.length > 0) {
        if (currentSelect && users.find(u => u.id === currentSelect)) {
            this.userSelectTarget.value = currentSelect
        } else {
            this.userSelectTarget.value = users[0].id
        }
        this.loadChores()
    } else {
        this.userSelectTarget.innerHTML = '<option>No users</option>'
        this.choreListTarget.innerHTML = ''
    }
  }

  addUser(event) {
    event.preventDefault()
    const form = event.target
    const name = form.name.value.trim()
    if (!name) return

    const colors = ['bg-red-100', 'bg-orange-100', 'bg-amber-100', 'bg-green-100', 'bg-emerald-100', 'bg-teal-100', 'bg-cyan-100', 'bg-sky-100', 'bg-blue-100', 'bg-indigo-100', 'bg-violet-100', 'bg-purple-100', 'bg-fuchsia-100', 'bg-pink-100', 'bg-rose-100']
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐝', '🐞']

    const user = {
      id: crypto.randomUUID(),
      name,
      color: colors[Math.floor(Math.random() * colors.length)],
      avatar: emojis[Math.floor(Math.random() * emojis.length)]
    }

    StorageService.saveUser(user)
    form.reset()
    this.renderUsers()
  }

  deleteUser(event) {
    if (!confirm('Delete user and all their chores?')) return
    const userId = event.currentTarget.dataset.userId
    StorageService.deleteUser(userId)
    this.renderUsers()
  }

  loadChores() {
    const userId = this.userSelectTarget.value
    if (!userId || userId === 'No users') return

    const chores = StorageService.getChoresForUser(userId)
    this.choreListTarget.innerHTML = chores.map(chore => `
      <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
        <span class="text-gray-700">${chore.title}</span>
        <button data-action="click->settings#deleteChore" data-chore-id="${chore.id}" class="text-gray-400 hover:text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `).join('')
  }

  addChore(event) {
    event.preventDefault()
    const userId = this.userSelectTarget.value
    if (!userId || userId === 'No users') return

    const form = event.target
    const title = form.title.value.trim()
    if (!title) return

    const chore = {
      id: crypto.randomUUID(),
      userId,
      title,
      icon: '🧹', // Default icon for now
      frequency: 'daily',
      lastCompletedAt: null
    }

    StorageService.saveChore(chore)
    form.reset()
    this.loadChores()
  }

  deleteChore(event) {
    const choreId = event.currentTarget.dataset.choreId
    StorageService.deleteChore(choreId)
    this.loadChores()
  }
}
