import { useState, useEffect, useCallback } from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'

const useCountDown = (deadline, onTimeout = null) => {
  const [ended, setEnded] = useState(false)

  const [hasReloaded, setHasReloaded] = useState(false)
  const router = useRouter()

  const formatTimeUnit = (unit) => (unit < 10 ? `0${unit}` : unit)

  const calculateTimeLeft = useCallback(() => {
    const now = moment()
    const diff = moment(deadline).diff(now)
    console.log(diff, 'diff')

    if (diff <= 0 && !ended && !hasReloaded) {
      onTimeout && onTimeout()
      setEnded(true)
      setHasReloaded(true)
      return { days: '00', hours: '00', minutes: '00', seconds: '00' }
    }

    const duration = moment.duration(diff)
    return {
      days: formatTimeUnit(Math.floor(duration.asDays())),
      hours: formatTimeUnit(duration.hours()),
      minutes: formatTimeUnit(duration.minutes()),
      seconds: formatTimeUnit(duration.seconds()),
    }
  }, [deadline, onTimeout, ended, hasReloaded])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [calculateTimeLeft])

  useEffect(() => {
    if (ended && !hasReloaded) {
      router.reload()
      setHasReloaded(true)
    }
  }, [ended, hasReloaded, router])

  return timeLeft
}

export default useCountDown
