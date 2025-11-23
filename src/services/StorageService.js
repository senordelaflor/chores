const STORAGE_KEYS = {
  USERS: 'chore_app_users',
  CHORES: 'chore_app_chores'
}

export const EXTRA_CHORES_ID = 'extra-chores'

export class StorageService {
  static getUsers() {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!usersJson) return []

    const users = JSON.parse(usersJson)
    return users.map(user => ({
      ...user,
      redeemedMinutes: user.redeemedMinutes || 0
    }))
  }

  static saveUser(user) {
    const users = this.getUsers()
    this.updateOrAddUser(users, user)
    this.persistUsers(users)
  }

  static updateUser(userId, updates) {
    const users = this.getUsers()
    const index = users.findIndex(user => user.id === userId)

    if (index === -1) return false

    users[index] = { ...users[index], ...updates }
    this.persistUsers(users)
    return true
  }

  static redeemMinutes(userId, minutes) {
    const users = this.getUsers()
    const index = users.findIndex(user => user.id === userId)

    if (index === -1) return false

    const currentRedeemed = users[index].redeemedMinutes || 0
    users[index].redeemedMinutes = currentRedeemed + minutes
    this.persistUsers(users)
    return true
  }

  static deleteUser(userId) {
    const users = this.getUsers().filter(user => user.id !== userId)
    this.persistUsers(users)

    const chores = this.getChores().filter(chore => chore.userId !== userId)
    this.persistChores(chores)
  }

  static getChores() {
    const choresJson = localStorage.getItem(STORAGE_KEYS.CHORES)
    return choresJson ? JSON.parse(choresJson) : []
  }

  static getChoresForUser(userId, date = new Date()) {
    const allChores = this.getChores()
    const userChores = allChores.filter(chore => chore.userId === userId)
    return this.filterChoresByFrequency(userChores, date)
  }

  static saveChore(chore) {
    const chores = this.getChores()
    this.updateOrAddChore(chores, chore)
    this.persistChores(chores)
  }

  static deleteChore(choreId) {
    const chores = this.getChores().filter(chore => chore.id !== choreId)
    this.persistChores(chores)
  }

  static getCurrentDateString() {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  static toggleChore(choreId, completedByUserId = null) {
    const chores = this.getChores()
    const chore = chores.find(c => c.id === choreId)

    if (!chore) return null

    const today = this.getCurrentDateString()
    const isCompletedToday = chore.lastCompletedAt === today

    if (isCompletedToday) {
      chore.lastCompletedAt = null
      chore.completedBy = null
    } else {
      chore.lastCompletedAt = today
      chore.completedBy = completedByUserId
    }

    this.saveChore(chore)
    return chore
  }

  static resetAllChores() {
    const chores = this.getChores()
    chores.forEach(chore => {
      chore.lastCompletedAt = null
      chore.completedBy = null
    })
    this.persistChores(chores)
  }

  static getGlobalChores() {
    const chores = this.getChores()
    const groups = {}

    chores.forEach(chore => {
      if (!groups[chore.title]) {
        groups[chore.title] = this.createGlobalChoreGroup(chore)
      }
      groups[chore.title].assignedUserIds.push(chore.userId)
    })

    return Object.values(groups)
  }

  static saveGlobalChore(title, icon, frequency, userIds, reward = 0) {
    let chores = this.getChores()
    const existingChores = chores.filter(chore => chore.title === title)
    chores = chores.filter(chore => chore.title !== title)

    userIds.forEach(userId => {
      const existingChore = existingChores.find(chore => chore.userId === userId)
      const newChore = this.createChoreInstance(existingChore, userId, title, icon, frequency, reward)
      chores.push(newChore)
    })

    this.persistChores(chores)
  }

  static updateGlobalChore(choreId, updates) {
    const chores = this.getChores()
    const originalChore = chores.find(chore => chore.id === choreId)

    if (!originalChore) return false

    const oldTitle = originalChore.title
    const otherChores = chores.filter(chore => chore.title !== oldTitle)
    const relatedChores = chores.filter(chore => chore.title === oldTitle)
    const updatedRelatedChores = []

    updates.assignedUserIds.forEach(userId => {
      const existingChore = relatedChores.find(chore => chore.userId === userId)
      const updatedChore = this.createUpdatedChoreInstance(existingChore, userId, originalChore, updates)
      updatedRelatedChores.push(updatedChore)
    })

    const newChores = [...otherChores, ...updatedRelatedChores]
    this.persistChores(newChores)
    return true
  }

  static deleteGlobalChore(title) {
    const chores = this.getChores().filter(chore => chore.title !== title)
    this.persistChores(chores)
  }

  // Private Helpers

  static persistUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  static persistChores(chores) {
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores))
  }

  static updateOrAddUser(users, user) {
    const index = users.findIndex(u => u.id === user.id)
    if (index >= 0) {
      users[index] = { ...users[index], ...user }
    } else {
      users.push({ ...user, redeemedMinutes: 0 })
    }
  }

  static updateOrAddChore(chores, chore) {
    const index = chores.findIndex(c => c.id === chore.id)
    if (index >= 0) {
      chores[index] = chore
    } else {
      chores.push(chore)
    }
  }

  static filterChoresByFrequency(chores, date) {
    const dayOfWeek = date.getDay()
    return chores.filter(chore => {
      if (!chore.frequency) return true
      if (chore.frequency.type === 'daily') return true
      if (chore.frequency.type === 'weekly') {
        return chore.frequency.days.includes(dayOfWeek)
      }
      return true
    })
  }

  static createGlobalChoreGroup(chore) {
    return {
      id: chore.id,
      title: chore.title,
      icon: chore.icon,
      frequency: chore.frequency || { type: 'daily', days: [] },
      reward: chore.reward || 0,
      assignedUserIds: []
    }
  }

  static createChoreInstance(existingChore, userId, title, icon, frequency, reward) {
    return {
      id: existingChore ? existingChore.id : crypto.randomUUID(),
      userId,
      title,
      icon,
      frequency,
      reward,
      lastCompletedAt: existingChore ? existingChore.lastCompletedAt : null,
      completedBy: existingChore ? existingChore.completedBy : null
    }
  }

  static createUpdatedChoreInstance(existingChore, userId, originalChore, updates) {
    if (existingChore) {
      return {
        ...existingChore,
        title: updates.title,
        icon: updates.icon || existingChore.icon,
        frequency: updates.frequency,
        reward: updates.reward !== undefined ? updates.reward : existingChore.reward || 0
      }
    }

    return {
      id: crypto.randomUUID(),
      userId,
      title: updates.title,
      icon: originalChore.icon,
      frequency: updates.frequency,
      reward: updates.reward || 0,
      lastCompletedAt: null,
      completedBy: null
    }
  }
}
