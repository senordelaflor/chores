import { Controller } from '@hotwired/stimulus'
import { StorageService } from '../services/StorageService'

export default class extends Controller {
  connect() {
    this.render()
    window.addEventListener('board:refresh', () => this.render())
  }

  render() {
    const users = StorageService.getUsers()

    if (users.length === 0) {
      this.renderEmptyState()
      return
    }

    const userColumns = users.map(user => this.generateUserColumnHTML(user)).join('')
    const extraColumn = this.generateExtraChoresColumnHTML()

    this.element.innerHTML = userColumns + extraColumn
  }

  renderEmptyState() {
    this.element.innerHTML = `
      <div class="flex flex-col items-center justify-center w-full h-full text-gray-400">
        <p class="text-xl">No users yet. Tap settings to add someone!</p>
      </div>
    `
  }

  generateUserColumnHTML(user) {
    const today = new Date()
    const chores = StorageService.getChoresForUser(user.id, today)
    const { completedCount, balance, coinBalance } = this.calculateUserStats(user, chores)

    return `
      <div class="min-w-[85vw] sm:min-w-[350px] h-full flex flex-col snap-center">
        ${this.generateUserHeaderHTML(user, chores.length, completedCount, balance, coinBalance)}
        <div class="flex-1 overflow-y-auto space-y-3 pb-6">
          ${this.generateChoresListHTML(chores)}
        </div>
      </div>
    `
  }

  calculateUserStats(user, chores) {
    let completedCount = 0

    chores.forEach(c => {
      const todayStr = StorageService.getCurrentDateString()
      if (c.lastCompletedAt === todayStr) {
        completedCount++
      }
    })

    const balance = user.walletMinutes || 0
    const coinBalance = user.walletCoins || 0

    return { completedCount, balance, coinBalance }
  }

  generateUserHeaderHTML(user, totalChores, completedCount, balance, coinBalance) {
    const progressPercentage = totalChores ? (completedCount / totalChores) * 100 : 0

    return `
      <div class="${user.color} rounded-3xl p-6 mb-4 shadow-sm transition-transform hover:scale-[1.02] duration-300">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center text-2xl shadow-sm">
              ${user.avatar}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">${user.name}</h2>
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm text-gray-600 font-medium">
                  ${completedCount}/${totalChores} completed
                </p>
                <div class="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-0.5">
                  <span class="text-xs font-bold text-gray-700 flex items-center gap-1">
                    📱 ${balance}m
                  </span>
                  <button
                    data-action="click->board#openRedeemModal"
                    data-user-id="${user.id}"
                    data-balance="${balance}"
                    class="text-gray-500 hover:text-purple-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.682-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </button>
                </div>
                <div class="flex items-center gap-1 bg-white/60 rounded-lg px-2 py-0.5">
                  <span class="text-xs font-bold text-gray-700 flex items-center gap-1">
                    🏅 ${coinBalance}
                  </span>
                  <button
                    data-action="click->board#openCoinModal"
                    data-user-id="${user.id}"
                    data-balance="${coinBalance}"
                    class="text-gray-500 hover:text-amber-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.682-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full bg-white/30 rounded-full h-3 overflow-hidden">
          <div class="bg-white h-full rounded-full transition-all duration-500"
               style="width: ${progressPercentage}%">
          </div>
        </div>
      </div>
    `
  }

  generateExtraChoresColumnHTML() {
    const extraChores = StorageService.getChoresForUser('extra-chores', new Date())

    return `
      <div class="min-w-[85vw] sm:min-w-[350px] h-full flex flex-col snap-center">
        <div class="bg-amber-50 rounded-3xl p-6 mb-4 shadow-sm border-2 border-dashed border-amber-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm text-amber-500">
              ✨
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Extra Chores</h2>
              <p class="text-sm text-gray-600 font-medium">Up for grabs!</p>
            </div>
          </div>

          <div class="w-full bg-amber-200/30 rounded-full h-3 overflow-hidden">
             <div class="bg-amber-300/50 h-full rounded-full w-full"></div>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 pb-6">
          ${this.generateChoresListHTML(extraChores, true)}
        </div>
      </div>
    `
  }

  generateChoresListHTML(chores, isExtra = false) {
    if (chores.length === 0) {
      return this.generateEmptyChoresHTML(isExtra)
    }

    return chores.map(chore => this.generateChoreCardHTML(chore, isExtra)).join('')
  }

  generateEmptyChoresHTML(isExtra) {
    return `
      <div class="flex flex-col items-center justify-center h-40 text-gray-400 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
        <span class="text-4xl mb-2">${isExtra ? '🌟' : '✨'}</span>
        <p>${isExtra ? 'No extra chores!' : 'Nothing to do today!'}</p>
      </div>
    `
  }

  generateChoreCardHTML(chore, isExtra) {
    const isCompleted = chore.lastCompletedAt === StorageService.getCurrentDateString()
    let completedByAvatar = ''

    if (isExtra && isCompleted && chore.completedBy) {
      const user = StorageService.getUsers().find(u => u.id === chore.completedBy)
      if (user) completedByAvatar = user.avatar
    }

    return `
      <div data-controller="chore"
           data-chore-id-value="${chore.id}"
           data-chore-completed-value="${isCompleted}"
           data-chore-is-extra-value="${isExtra}"
           class="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md cursor-pointer select-none"
           data-action="click->chore#toggle">

        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
            ${chore.icon}
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 transition-colors duration-300" data-chore-target="title">${chore.title}</h3>
            <div class="flex items-center gap-2">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">${isExtra ? 'Extra' : 'Daily'}</p>
              ${chore.reward > 0 ? `
                <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center gap-0.5">
                  📱 ${chore.reward}m
                </span>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="relative">
          <div data-chore-target="checkbox"
               class="w-8 h-8 rounded-full border-2 border-gray-200 transition-all duration-300 flex items-center justify-center overflow-hidden">
            ${isExtra && isCompleted ? `<span class="text-lg">${completedByAvatar}</span>` : `
            <svg data-chore-target="checkIcon" class="w-5 h-5 text-white transform scale-0 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>`}
          </div>
        </div>
      </div>
    `
  }

  openRedeemModal(event) {
    const userId = event.currentTarget.dataset.userId
    const balance = event.currentTarget.dataset.balance

    window.dispatchEvent(new CustomEvent('app:request-redeem', {
      detail: { userId, balance }
    }))
  }

  openCoinModal(event) {
    const userId = event.currentTarget.dataset.userId
    const balance = event.currentTarget.dataset.balance

    window.dispatchEvent(new CustomEvent('app:request-coin-redeem', {
      detail: { userId, balance }
    }))
  }
}
