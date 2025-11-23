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
    this.userListTarget.innerHTML = this.generateUserListHTML(users)
  }

  generateUserListHTML(users) {
    return users.map(user => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-xl">
            ${user.avatar}
          </div>
          <span class="font-medium text-gray-700">${user.name}</span>
        </div>
        <div class="flex items-center gap-1">
          <button data-action="click->settings#editUser" data-user-id="${user.id}" class="text-gray-400 hover:text-purple-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button data-action="click->settings#deleteUser" data-user-id="${user.id}" class="text-gray-400 hover:text-red-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    `).join('')
  }

  addUser(event) {
    event.preventDefault()
    const form = event.target
    const name = form.name.value.trim()
    if (!name) return

    const user = this.createNewUser(name)
    StorageService.saveUser(user)

    form.reset()
    this.renderUsers()
    this.renderGlobalChores()
  }

  createNewUser(name) {
    const colors = ['bg-red-100', 'bg-orange-100', 'bg-amber-100', 'bg-green-100', 'bg-emerald-100', 'bg-teal-100', 'bg-cyan-100', 'bg-sky-100', 'bg-blue-100', 'bg-indigo-100', 'bg-violet-100', 'bg-purple-100', 'bg-fuchsia-100', 'bg-pink-100', 'bg-rose-100']
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐝', '🐞']

    return {
      id: crypto.randomUUID(),
      name,
      color: colors[Math.floor(Math.random() * colors.length)],
      avatar: emojis[Math.floor(Math.random() * emojis.length)]
    }
  }

  deleteUser(event) {
    if (!confirm('Delete user and all their chores?')) return
    const userId = event.currentTarget.dataset.userId
    StorageService.deleteUser(userId)
    this.renderUsers()
    this.renderGlobalChores()
  }

  editUser(event) {
    const userId = event.currentTarget.dataset.userId
    window.dispatchEvent(new CustomEvent('app:edit-user', { detail: { userId } }))
  }

  renderGlobalChores() {
    const chores = StorageService.getGlobalChores()
    const users = StorageService.getUsers()
    this.globalChoreListTarget.innerHTML = this.generateGlobalChoresHTML(chores, users)

    if (!this.editingChoreId) {
        this.renderAddForm(users)
    }
  }

  generateGlobalChoresHTML(chores, users) {
    return chores.map(chore => {
      const assignedNames = this.getAssignedNames(chore.assignedUserIds, users)
      const frequencyText = this.getFrequencyText(chore.frequency)

      return `
        <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl">${chore.icon}</span>
              <h4 class="font-semibold text-gray-800">${chore.title}</h4>
              ${chore.reward > 0 ? `<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold">📱 ${chore.reward}m</span>` : ''}
            </div>
            <p class="text-sm text-gray-500 mt-1">Assigned to: ${assignedNames || 'No one'}</p>
            <p class="text-xs text-purple-500 font-medium mt-0.5 uppercase tracking-wide">${frequencyText}</p>
          </div>
          <div class="flex items-center gap-1">
            <button data-action="click->settings#editGlobalChore" data-chore-id="${chore.id}" class="text-gray-400 hover:text-purple-500 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button data-action="click->settings#deleteGlobalChore" data-title="${chore.title}" class="text-gray-400 hover:text-red-500 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      `
    }).join('')
  }

  getAssignedNames(userIds, users) {
    return userIds.map(id => {
      if (id === 'extra-chores') return '✨ Extra Chores'
      const user = users.find(u => u.id === id)
      return user ? user.name : 'Unknown'
    }).join(', ')
  }

  getFrequencyText(frequency) {
    if (frequency.type === 'daily') return 'Daily'
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return frequency.days.map(d => days[d]).join(', ')
  }

  renderAddForm(users, choreToEdit = null) {
    const isEditing = !!choreToEdit
    const titleValue = isEditing ? choreToEdit.title : ''
    const assignedIds = isEditing ? choreToEdit.assignedUserIds : []
    const isDaily = isEditing ? choreToEdit.frequency.type === 'daily' : true
    const selectedDays = isEditing && !isDaily ? choreToEdit.frequency.days : []
    const iconValue = isEditing ? choreToEdit.icon : '🧹'
    const rewardValue = isEditing ? (choreToEdit.reward || 0) : 0

    this.choreFormTarget.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-700">${isEditing ? 'Edit Chore' : 'Add New Chore'}</h4>
            ${isEditing ? `<button type="button" data-action="click->settings#cancelEdit" class="text-sm text-gray-500 hover:text-gray-700">Cancel</button>` : ''}
        </div>

        <div class="flex gap-2">
          <div class="w-20">
             <input type="text" name="icon" value="${iconValue}" placeholder="Emoji" required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl">
          </div>
          <input type="text" name="title" value="${titleValue}" placeholder="Chore Title (e.g. Clean Room)" required
            class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
        </div>

        ${this.generateUserSelectionHTML(users, assignedIds)}
        ${this.generateFrequencyHTML(isDaily, selectedDays)}
        ${this.generateRewardHTML(rewardValue)}

        <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
          ${isEditing ? 'Update Chore' : 'Create Chore'}
        </button>
      </div>
    `
  }

  generateUserSelectionHTML(users, assignedIds) {
    return `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Assign to:</label>
        <div class="flex flex-wrap gap-2">
          ${users.map(user => this.generateUserCheckboxHTML(user, assignedIds)).join('')}
          ${this.generateExtraChoresCheckboxHTML(assignedIds)}
        </div>
      </div>
    `
  }

  generateUserCheckboxHTML(user, assignedIds) {
    return `
      <label class="cursor-pointer select-none">
        <input type="checkbox" name="users" value="${user.id}" class="peer sr-only" ${assignedIds.includes(user.id) ? 'checked' : ''}>
        <div class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 peer-checked:bg-purple-100 peer-checked:text-purple-700 peer-checked:ring-2 peer-checked:ring-purple-500 transition-all text-sm font-medium flex items-center gap-2">
          <span>${user.avatar}</span>
          ${user.name}
        </div>
      </label>
    `
  }

  generateExtraChoresCheckboxHTML(assignedIds) {
    return `
      <label class="cursor-pointer select-none">
        <input type="checkbox" name="users" value="extra-chores" class="peer sr-only" ${assignedIds.includes('extra-chores') ? 'checked' : ''}>
        <div class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 peer-checked:bg-amber-100 peer-checked:text-amber-700 peer-checked:ring-2 peer-checked:ring-amber-500 transition-all text-sm font-medium flex items-center gap-2">
          <span>✨</span>
          Extra Chores
        </div>
      </label>
    `
  }

  generateFrequencyHTML(isDaily, selectedDays) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return `
      <div data-controller="frequency">
        <label class="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="checkbox" name="isDaily" ${isDaily ? 'checked' : ''} data-frequency-target="dailyCheck" data-action="change->frequency#toggleDays" class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300">
          <span class="text-gray-700 font-medium">Daily Task</span>
        </label>

        <div data-frequency-target="daysContainer" class="${isDaily ? 'hidden' : ''} pl-1">
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Days</label>
          <div class="flex justify-between gap-1">
            ${days.map((day, index) => `
              <label class="cursor-pointer">
                <input type="checkbox" name="days" value="${index}" class="peer sr-only" ${selectedDays.includes(index) ? 'checked' : ''}>
                <div class="w-9 h-9 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center text-xs font-bold peer-checked:bg-purple-600 peer-checked:text-white transition-all border border-gray-100">
                  ${day.slice(0, 1)}
                </div>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }

  generateRewardHTML(currentReward) {
    return `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Reward (Screen Time):</label>
        <div class="flex gap-2">
          ${[0, 15, 30, 45, 60].map(mins => `
            <label class="cursor-pointer">
              <input type="radio" name="reward" value="${mins}" class="peer sr-only" ${currentReward === mins ? 'checked' : ''}>
              <div class="px-3 py-2 rounded-xl bg-gray-50 text-gray-500 font-medium text-sm border border-transparent peer-checked:bg-blue-50 peer-checked:text-blue-600 peer-checked:border-blue-200 transition-all">
                ${mins === 0 ? 'None' : `${mins}m`}
              </div>
            </label>
          `).join('')}
        </div>
      </div>
    `
  }

  addGlobalChore(event) {
    event.preventDefault()
    const form = event.target
    const title = form.title.value.trim()
    if (!title) return

    const userIds = this.getSelectedUserIds(form)
    if (userIds.length === 0) {
      alert('Please select at least one user')
      return
    }

    const frequency = this.getFrequencyFromForm(form)
    if (frequency.type === 'weekly' && frequency.days.length === 0) {
        alert('Please select at least one day')
        return
    }

    const reward = parseInt(form.querySelector('input[name="reward"]:checked').value)
    const icon = form.icon.value.trim() || '🧹'

    if (this.editingChoreId) {
        StorageService.updateGlobalChore(this.editingChoreId, {
            title,
            icon,
            assignedUserIds: userIds,
            frequency,
            reward
        })
        this.editingChoreId = null
    } else {
        StorageService.saveGlobalChore(title, icon, frequency, userIds, reward)
    }

    this.renderGlobalChores()
    this.renderAddForm(StorageService.getUsers())
  }

  getSelectedUserIds(form) {
    const userCheckboxes = form.querySelectorAll('input[name="users"]:checked')
    return Array.from(userCheckboxes).map(cb => cb.value)
  }

  getFrequencyFromForm(form) {
    const isDaily = form.querySelector('input[name="isDaily"]').checked
    if (isDaily) {
        return { type: 'daily', days: [] }
    }

    const dayCheckboxes = form.querySelectorAll('input[name="days"]:checked')
    const days = Array.from(dayCheckboxes).map(cb => parseInt(cb.value))
    return { type: 'weekly', days }
  }

  editGlobalChore(event) {
    const choreId = event.currentTarget.dataset.choreId
    const chores = StorageService.getGlobalChores()
    const chore = chores.find(c => c.id === choreId)

    if (chore) {
        this.editingChoreId = choreId
        this.renderAddForm(StorageService.getUsers(), chore)
        this.choreFormTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  cancelEdit() {
    this.editingChoreId = null
    this.renderAddForm(StorageService.getUsers())
  }

  deleteGlobalChore(event) {
    const title = event.currentTarget.dataset.title
    if (confirm(`Delete "${title}" for all users?`)) {
      StorageService.deleteGlobalChore(title)
      this.renderGlobalChores()
    }
  }

  reloadApp() {
    if (confirm('Update app now? This will reload the page.')) {
      if (window.forceAppUpdate) {
        window.forceAppUpdate()
      } else {
        window.location.reload()
      }
    }
  }

  resetTasks() {
    if (confirm('Are you sure? This will uncheck ALL tasks for today. This cannot be undone.')) {
      StorageService.resetAllChores()
      window.dispatchEvent(new CustomEvent('board:refresh'))
      alert('All tasks have been reset.')
    }
  }
}
