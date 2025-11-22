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

  static getChoresForUser(userId) {
    return this.getChores().filter(c => c.userId === userId)
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
    // But if we wanted to strictly reset state, we could do it here.
    // For now, the UI will just check if lastCompletedAt === today.
  }
}
