import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ["dailyCheck", "daysContainer"]

  toggleDays() {
    if (this.dailyCheckTarget.checked) {
      this.daysContainerTarget.classList.add('hidden')
    } else {
      this.daysContainerTarget.classList.remove('hidden')
    }
  }
}
