import { useState, useEffect, useCallback } from 'react'
import moment from 'moment'

const useCountDown = (deadline, onTimeout = null) => {
  const [ended, setEnded] = useState(false)

  const formatTimeUnit = (unit) =>
    unit < 10 ? `0${unit.toString()}` : unit.toString()

  const calculateTimeLeft = useCallback(() => {
    const now = moment()
    const diff = moment(deadline).diff(now)

    if (diff <= 0) {
      onTimeout && onTimeout()
      setEnded(true)
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const duration = moment.duration(diff)
    return {
      days: formatTimeUnit(duration.days()),
      hours: formatTimeUnit(duration.hours()),
      minutes: formatTimeUnit(duration.minutes()),
      seconds: formatTimeUnit(duration.seconds()),
    }
  }, [deadline, onTimeout])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    if (ended) {
      return clearInterval(timerInterval)
    }

    return () => {
      clearInterval(timerInterval)
    }
  }, [deadline, onTimeout, calculateTimeLeft, ended])

  return timeLeft
}

export default useCountDown
