const STORAGE_KEYS = {
  USERS: 'chore_app_users',
  CHORES: 'chore_app_chores'
}

export class StorageService {
  static getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  }

  static saveUser(user) {
    const users = this.getUsers()
    // Check if user exists
    const index = users.findIndex(u => u.id === user.id)
    if (index >= 0) {
      users[index] = user
    } else {
      users.push(user)
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  static deleteUser(userId) {
    const users = this.getUsers().filter(u => u.id !== userId)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

    // Also delete chores for this user
    const chores = this.getChores().filter(c => c.userId !== userId)
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }

  static getChores() {
    const chores = localStorage.getItem(STORAGE_KEYS.CHORES)
    return chores ? JSON.parse(chores) : []
  }

  static getChoresForUser(userId, date = new Date()) {
    const chores = this.getChores().filter(c => c.userId === userId)

    // Filter by frequency
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

    return chores.filter(chore => {
      // Backwards compatibility for old chores (assume daily)
      if (!chore.frequency) return true

      if (chore.frequency.type === 'daily') return true

      if (chore.frequency.type === 'weekly') {
        return chore.frequency.days.includes(dayOfWeek)
      }

      return true
    })
  }

  static saveChore(chore) {
    const chores = this.getChores()
    const index = chores.findIndex(c => c.id === chore.id)
    if (index >= 0) {
      chores[index] = chore
    } else {
      chores.push(chore)
    }
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }

  static deleteChore(choreId) {
    const chores = this.getChores().filter(c => c.id !== choreId)
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }

  static toggleChore(choreId) {
    const chores = this.getChores()
    const chore = chores.find(c => c.id === choreId)
    if (chore) {
      const today = new Date().toISOString().split('T')[0]
      if (chore.lastCompletedAt === today) {
        chore.lastCompletedAt = null // Uncheck
      } else {
        chore.lastCompletedAt = today // Check
      }
      this.saveChore(chore)
      return chore
    }
    return null
  }

  static resetDailyChores() {
    // This logic is implicitly handled by checking lastCompletedAt vs today
  }

  // Helper to group chores by title (for the settings UI)
  static getGlobalChores() {
    const chores = this.getChores()
    const groups = {}

    chores.forEach(chore => {
      if (!groups[chore.title]) {
        groups[chore.title] = {
          title: chore.title,
          icon: chore.icon,
          frequency: chore.frequency || { type: 'daily', days: [] },
          assignedUserIds: []
        }
      }
      groups[chore.title].assignedUserIds.push(chore.userId)
    })

    return Object.values(groups)
  }

  static saveGlobalChore(title, icon, frequency, userIds) {
    let chores = this.getChores()

    // 1. Remove existing chores with this title (to overwrite/update)
    // NOTE: This is a simple approach. In a real app, we might want to preserve IDs
    // to keep history, but for this scope, recreating them is fine.
    // However, to preserve "completed" status for today, we should try to match them.

    const existingChores = chores.filter(c => c.title === title)
    chores = chores.filter(c => c.title !== title)

    // 2. Create new chores for selected users
    userIds.forEach(userId => {
      // Try to find existing state to preserve
      const existing = existingChores.find(c => c.userId === userId)

      chores.push({
        id: existing ? existing.id : crypto.randomUUID(),
        userId,
        title,
        icon,
        frequency,
        lastCompletedAt: existing ? existing.lastCompletedAt : null
      })
    })

    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }

  static deleteGlobalChore(title) {
    const chores = this.getChores().filter(c => c.title !== title)
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }
}
