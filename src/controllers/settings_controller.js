import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  static targets = ["userList", "choreList", "globalChoreList", "choreForm"]

  connect() {
    this.renderUsers()
    this.renderGlobalChores()
    window.addEventListener('settings:refresh', () => {
      this.renderUsers()
      this.renderGlobalChores()
    })
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

    // The userSelect and choreList logic is removed as per the new global chore management
    // and the updated static targets.
    // The choreListTarget is now used for global chores.
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
    this.renderGlobalChores() // Re-render global chores to update user assignments
  }

  deleteUser(event) {
    if (!confirm('Delete user and all their chores?')) return
    const userId = event.currentTarget.dataset.userId
    StorageService.deleteUser(userId)
    this.renderUsers()
    this.renderGlobalChores() // Re-render global chores to update user assignments
  }

  renderGlobalChores() {
    const chores = StorageService.getGlobalChores()
    const users = StorageService.getUsers()

    this.globalChoreListTarget.innerHTML = chores.map(chore => {
      const assignedNames = chore.assignedUserIds.map(id => {
        if (id === 'extra-chores') return '✨ Extra Chores'
        const user = users.find(u => u.id === id)
        return user ? user.name : 'Unknown'
      }).join(', ')

      const frequencyText = chore.frequency.type === 'daily'
        ? 'Daily'
        : chore.frequency.days.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')

      return `
        <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl">${chore.icon}</span>
              <h4 class="font-semibold text-gray-800">${chore.title}</h4>
            </div>
            <p class="text-sm text-gray-500 mt-1">Assigned to: ${assignedNames || 'No one'}</p>
            <p class="text-xs text-purple-500 font-medium mt-0.5 uppercase tracking-wide">${frequencyText}</p>
          </div>
          <button data-action="click->settings#deleteGlobalChore" data-title="${chore.title}" class="text-gray-400 hover:text-red-500 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      `
    }).join('')

    // Render Add Form
    this.renderAddForm(users)
  }

  renderAddForm(users) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    this.choreFormTarget.innerHTML = `
      <div class="space-y-4">
        <input type="text" name="title" placeholder="Chore Title (e.g. Clean Room)" required
          class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">

        <!-- Users Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Assign to:</label>
          <div class="flex flex-wrap gap-2">
            ${users.map(user => `
              <label class="cursor-pointer select-none">
                <input type="checkbox" name="users" value="${user.id}" class="peer sr-only" checked>
                <div class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 peer-checked:bg-purple-100 peer-checked:text-purple-700 peer-checked:ring-2 peer-checked:ring-purple-500 transition-all text-sm font-medium flex items-center gap-2">
                  <span>${user.avatar}</span>
                  ${user.name}
                </div>
              </label>
            `).join('')}

            <!-- Extra Chores Option -->
            <label class="cursor-pointer select-none">
              <input type="checkbox" name="users" value="extra-chores" class="peer sr-only">
              <div class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 peer-checked:bg-amber-100 peer-checked:text-amber-700 peer-checked:ring-2 peer-checked:ring-amber-500 transition-all text-sm font-medium flex items-center gap-2">
                <span>✨</span>
                Extra Chores
              </div>
            </label>
          </div>
        </div>

        <!-- Frequency -->
        <div data-controller="frequency">
          <label class="flex items-center gap-2 mb-3 cursor-pointer">
            <input type="checkbox" name="isDaily" checked data-frequency-target="dailyCheck" data-action="change->frequency#toggleDays" class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300">
            <span class="text-gray-700 font-medium">Daily Task</span>
          </label>

          <div data-frequency-target="daysContainer" class="hidden pl-1">
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Days</label>
            <div class="flex justify-between gap-1">
              ${days.map((day, index) => `
                <label class="cursor-pointer">
                  <input type="checkbox" name="days" value="${index}" class="peer sr-only">
                  <div class="w-9 h-9 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center text-xs font-bold peer-checked:bg-purple-600 peer-checked:text-white transition-all border border-gray-100">
                    ${day.slice(0, 1)}
                  </div>
                </label>
              `).join('')}
            </div>
          </div>
        </div>

        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
          Create Chore
        </button>
      </div>
    `
  }

  addGlobalChore(event) {
    event.preventDefault()
    const form = event.target
    const title = form.title.value.trim()
    if (!title) return

    // Get selected users
    const userCheckboxes = form.querySelectorAll('input[name="users"]:checked')
    const userIds = Array.from(userCheckboxes).map(cb => cb.value)

    if (userIds.length === 0) {
      alert('Please select at least one user')
      return
    }

    // Get frequency
    const isDaily = form.querySelector('input[name="isDaily"]').checked
    let frequency = { type: 'daily', days: [] }

    if (!isDaily) {
      const dayCheckboxes = form.querySelectorAll('input[name="days"]:checked')
      const days = Array.from(dayCheckboxes).map(cb => parseInt(cb.value))
      if (days.length === 0) {
        alert('Please select at least one day')
        return
      }
      frequency = { type: 'weekly', days }
    }

    const icons = ['🧹', '🛏️', '🧸', '🦷', '📚', '🍽️', '🪴', '🐕', '🗑️', '🧺']
    const icon = icons[Math.floor(Math.random() * icons.length)]

    StorageService.saveGlobalChore(title, icon, frequency, userIds)
    this.renderGlobalChores()
  }

  deleteGlobalChore(event) {
    const title = event.currentTarget.dataset.title
    if (confirm(`Delete "${title}" for all users?`)) {
      StorageService.deleteGlobalChore(title)
      this.renderGlobalChores()
    }
  }
}
