const STORAGE_KEYS = {
  USERS: 'chore_app_users',
  CHORES: 'chore_app_chores'
}

export const EXTRA_CHORES_ID = 'extra-chores'

export class StorageService {
  static getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!users) return []

    // Ensure all users have redeemedMinutes initialized
    const parsedUsers = JSON.parse(users)
    return parsedUsers.map(u => ({
      ...u,
      redeemedMinutes: u.redeemedMinutes || 0
    }))
  }

  static saveUser(user) {
    const users = this.getUsers()
    // Check if user exists
    const index = users.findIndex(u => u.id === user.id)
    if (index >= 0) {
      users[index] = { ...users[index], ...user }
    } else {
      users.push({ ...user, redeemedMinutes: 0 })
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  static updateUser(userId, updates) {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index >= 0) {
      users[index] = { ...users[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      return true
    }
    return false
  }

  static redeemMinutes(userId, minutes) {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index >= 0) {
      users[index].redeemedMinutes = (users[index].redeemedMinutes || 0) + minutes
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
      return true
    }
    return false
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

  static getLocalDate() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  static toggleChore(choreId, completedByUserId = null) {
    const chores = this.getChores()
    const chore = chores.find(c => c.id === choreId)
    if (chore) {
      const today = this.getLocalDate()
      if (chore.lastCompletedAt === today) {
        chore.lastCompletedAt = null // Uncheck
        chore.completedBy = null
      } else {
        chore.lastCompletedAt = today // Check
        chore.completedBy = completedByUserId
      }
      this.saveChore(chore)
      return chore
    }
    return null
  }

  static resetDailyChores() {
    // This logic is implicitly handled by checking lastCompletedAt vs today
  }

  static resetAllChores() {
    const chores = this.getChores()
    chores.forEach(chore => {
      chore.lastCompletedAt = null
      chore.completedBy = null
    })
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }

  // Helper to group chores by title (for the settings UI)
  static getGlobalChores() {
    const chores = this.getChores()
    const groups = {}

    chores.forEach(chore => {
      if (!groups[chore.title]) {
        groups[chore.title] = {
          id: chore.id, // Use the first chore's ID as the group identifier
          title: chore.title,
          icon: chore.icon,
          frequency: chore.frequency || { type: 'daily', days: [] },
          reward: chore.reward || 0,
          assignedUserIds: []
        }
      }
      groups[chore.title].assignedUserIds.push(chore.userId)
    })

    return Object.values(groups)
  }

  static saveGlobalChore(title, icon, frequency, userIds, reward = 0) {
    let chores = this.getChores()

    const existingChores = chores.filter(c => c.title === title)
    chores = chores.filter(c => c.title !== title)

    userIds.forEach(userId => {
      const existing = existingChores.find(c => c.userId === userId)
      chores.push({
        id: existing ? existing.id : crypto.randomUUID(),
        userId,
        title,
        icon,
        frequency,
        reward,
        lastCompletedAt: existing ? existing.lastCompletedAt : null,
        completedBy: existing ? existing.completedBy : null
      })
    })

    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }

  static updateGlobalChore(choreId, updates) {
    let chores = this.getChores()

    // 1. Find the original chore to get the old title
    const originalChore = chores.find(c => c.id === choreId)
    if (!originalChore) return false

    const oldTitle = originalChore.title

    // 2. Identify chores to keep, update, or remove
    // We want to keep chores that are NOT related to this global chore
    const otherChores = chores.filter(c => c.title !== oldTitle)

    // Chores that ARE related
    const relatedChores = chores.filter(c => c.title === oldTitle)

    const updatedRelatedChores = []

    // 3. Process updates
    updates.assignedUserIds.forEach(userId => {
      // Check if this user already had this chore
      const existing = relatedChores.find(c => c.userId === userId)

      if (existing) {
        // Update existing chore
        updatedRelatedChores.push({
          ...existing,
          title: updates.title,
          icon: updates.icon || existing.icon, // Use new icon if provided, else keep existing
          frequency: updates.frequency,
          reward: updates.reward !== undefined ? updates.reward : existing.reward || 0,
          // Preserve ID and completion status
        })
      } else {
        // New assignment for this user
        updatedRelatedChores.push({
          id: crypto.randomUUID(),
          userId,
          title: updates.title,
          icon: originalChore.icon, // Use same icon as original
          frequency: updates.frequency,
          reward: updates.reward || 0,
          lastCompletedAt: null,
          completedBy: null
        })
      }
    })

    // 4. Save everything back
    const newChores = [...otherChores, ...updatedRelatedChores]
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(newChores))
    return true
  }

  static deleteGlobalChore(title) {
    const chores = this.getChores().filter(c => c.title !== title)
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }
}
