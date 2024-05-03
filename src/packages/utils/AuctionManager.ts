import moment from 'moment'

enum ActivityStatus {
  NotStarted = 'NotStarted',
  Bidding = 'Bidding',
  Staking = 'Staking',
  Playing = 'Playing'
}

interface Activity {
  id: number;
  startTime: moment.Moment;
  biddingDuration: moment.Duration;
  stakingDuration: moment.Duration;
  playDuration: moment.Duration;
}

class PeriodicActivityManager {
  private activitiesQueue: Activity[] = []
  private intervalId?: NodeJS.Timeout

  public addActivity(activity: Activity) {
    this.activitiesQueue.push(activity)
  }

  private getActivityStatus(currentTime: moment.Moment, activity: Activity): ActivityStatus {
    if (currentTime.isBefore(activity.startTime)) {
      return ActivityStatus.NotStarted
    } else if (currentTime.isBetween(activity.startTime, activity.startTime.clone().add(activity.biddingDuration))) {
      return ActivityStatus.Bidding
    } else if (currentTime.isBetween(activity.startTime.clone().add(activity.biddingDuration), activity.startTime.clone().add(activity.playDuration))) {
      return ActivityStatus.Staking
    } else {
      return ActivityStatus.Playing
    }
  }

  private updateActivityStatus() {
    const currentTime = moment()
    for (const activity of this.activitiesQueue) {
      const status = this.getActivityStatus(currentTime, activity)
      if (status === ActivityStatus.Playing) {
        this.startNextCycle(activity)
      }
    }
  }

  private startNextCycle(activity: Activity) {
    const nextActivity: Activity = {
      id: activity.id + 1,
      startTime: activity.startTime.clone().add(activity.playDuration),
      biddingDuration: activity.biddingDuration,
      stakingDuration: activity.stakingDuration,
      playDuration: activity.playDuration
    }
    this.addActivity(nextActivity)
  }

  public run() {
    this.intervalId = setInterval(() => {
      this.updateActivityStatus()
    }, 1000)
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  public getLastActivity(): Activity | undefined {
    return this.activitiesQueue.length > 0 ? this.activitiesQueue[this.activitiesQueue.length - 1] : undefined
  }
}

const manager = new PeriodicActivityManager()

manager.addActivity({
  id: 1,
  startTime: moment.utc('2024-03-01T08:00:00Z'),
  biddingDuration: moment.duration(16, 'hours'),
  stakingDuration: moment.duration(8, 'hours'),
  playDuration: moment.duration(24, 'hours')
})

manager.run()
