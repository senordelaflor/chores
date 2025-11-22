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
      this.element.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <p class="text-xl">No users yet. Tap settings to add someone!</p>
        </div>
      `
      return
    }

    this.element.innerHTML = users.map(user => {
      const today = new Date()
      const chores = StorageService.getChoresForUser(user.id, today)
      const completedCount = chores.filter(c => {
        const todayStr = today.toISOString().split('T')[0]
        return c.lastCompletedAt === todayStr
      }).length

      // Calculate stars (total completed chores ever? or just today?)
      // For now, let's just show today's count.
      // Or maybe we can store a 'score' in the user object later.

      return `
        <div class="min-w-[85vw] sm:min-w-[350px] h-full flex flex-col snap-center">
          <!-- User Header -->
          <div class="${user.color} rounded-3xl p-6 mb-4 shadow-sm transition-transform hover:scale-[1.02] duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center text-2xl shadow-sm">
                  ${user.avatar}
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-gray-800">${user.name}</h2>
                  <p class="text-sm text-gray-600 font-medium">
                    ${completedCount}/${chores.length} completed
                  </p>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div class="bg-white h-full rounded-full transition-all duration-500"
                   style="width: ${chores.length ? (completedCount / chores.length) * 100 : 0}%">
              </div>
            </div>
          </div>

          <!-- Chores List -->
          <div class="flex-1 overflow-y-auto space-y-3 pb-6">
            ${chores.length ? chores.map(chore => `
              <div data-controller="chore"
                   data-chore-id-value="${chore.id}"
                   data-chore-completed-value="${chore.lastCompletedAt === new Date().toISOString().split('T')[0]}"
                   class="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md cursor-pointer select-none"
                   data-action="click->chore#toggle">

                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                    ${chore.icon}
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-800 transition-colors duration-300" data-chore-target="title">${chore.title}</h3>
                    <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Daily</p>
                  </div>
                </div>

                <div class="relative">
                  <div data-chore-target="checkbox"
                       class="w-8 h-8 rounded-full border-2 border-gray-200 transition-all duration-300 flex items-center justify-center">
                    <svg data-chore-target="checkIcon" class="w-5 h-5 text-white transform scale-0 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            `).join('') : `
              <div class="flex flex-col items-center justify-center h-40 text-gray-400 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                <span class="text-4xl mb-2">✨</span>
                <p>Nothing to do today!</p>
              </div>
            `}
          </div>
        </div>
      `
    }).join('')
  }
}
