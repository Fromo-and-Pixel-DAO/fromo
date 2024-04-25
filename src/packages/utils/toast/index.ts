import { ErrorIcon } from 'packages/assets/ErrorIcon'
import SuccessIcon from 'packages/assets/SuccessIcon'
import React from 'react'
import { Flip, toast } from 'react-toastify'

export const toastSuccess = (message: string, delay?: number): void => {
  if (message) {
    if (delay) {
      toast.success(message, {
        icon: React.createElement(SuccessIcon),
        position: toast.POSITION.TOP_CENTER,
        pauseOnHover: true,
        transition: Flip,
        autoClose: delay
      })
    } else {
      toast.success(message, {
        icon: React.createElement(SuccessIcon),
        position: toast.POSITION.TOP_CENTER,
        autoClose: false
      })
    }
  }
}

export const toastWarning = (message: string, delay?: number): void => {
  if (message) {
    if (delay) {
      toast.warning(message, {
        icon: React.createElement(SuccessIcon),
        position: toast.POSITION.TOP_CENTER,
        pauseOnHover: true,
        transition: Flip,
        autoClose: delay
      })
    } else {
      toast.warning(message, {
        icon: React.createElement(SuccessIcon),
        position: toast.POSITION.TOP_CENTER,
        transition: Flip,
        autoClose: false
      })
    }
  }
}

type ErrorMsg = Error | string | string[]

export const toastError = (error: ErrorMsg, delay?: number) => {
  let toastData: any = ''

  if (typeof error === 'string' || (error && error instanceof Array)) {
    toastData = error
  }

  if (toastData && typeof toastData === 'string' && toastData !== '') {
    if (delay) {
      toast.error(toastData, {
        icon: React.createElement(ErrorIcon),
        position: toast.POSITION.TOP_CENTER,
        pauseOnHover: true,
        transition: Flip,
        autoClose: delay
      })
    } else {
      toast.error(toastData, {
        icon: React.createElement(ErrorIcon),
        position: toast.POSITION.TOP_CENTER,
        pauseOnHover: true,
        transition: Flip,
        autoClose: false
      })
    }
  } else if (toastData && toastData instanceof Array) {
    toastData.forEach((err) => {
      if (delay) {
        toastError(err)
      }
    })
  }
}
