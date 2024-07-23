import IconError from '@components/Icon/icon-error'
import IconSuccess from '@components/Icon/icon-success'
import IconWarning from '@components/Icon/icon-warning'
import React from 'react'
import { Flip, toast } from 'react-toastify'

export const toastSuccess = (message: string, delay = 3000): void => {
  if (message) {
    if (delay) {
      toast.success(message, {
        icon: React.createElement(IconSuccess),
        position: toast.POSITION.TOP_CENTER,
        pauseOnHover: true,
        transition: Flip,
        autoClose: delay,
        closeButton: false,
        style: {
          color: 'white',
          background: '#00B25D',
          fontFamily: 'Montserrat',
          fontWeight: '500',
          borderRadius: '40px',
          padding: '16px',
          minHeight: '56px',
        },
      })
    } else {
      toast.success(message, {
        icon: React.createElement(IconSuccess),
        position: toast.POSITION.TOP_CENTER,
        closeButton: false,
        autoClose: false,
        style: {
          color: 'white',
          background: '#00B25D',
          fontFamily: 'Montserrat',
          fontWeight: '500',
          borderRadius: '40px',
          padding: '16px',
          minHeight: '56px',
        },
      })
    }
  }
}

export const toastWarning = (message: string, delay = 3000): void => {
  if (message) {
    if (delay) {
      toast.warning(message, {
        icon: React.createElement(IconWarning),
        position: toast.POSITION.TOP_CENTER,
        closeButton: false,
        pauseOnHover: true,
        transition: Flip,
        autoClose: delay,
        style: {
          color: 'black',
          background: '#FFBD13',
          fontFamily: 'Montserrat',
          fontWeight: '500',
          borderRadius: '40px',
          padding: '16px',
          minHeight: '56px',
        },
      })
    } else {
      toast.warning(message, {
        icon: React.createElement(IconWarning),
        position: toast.POSITION.TOP_CENTER,
        closeButton: false,
        transition: Flip,
        autoClose: false,
        style: {
          color: 'black',
          background: '#FFBD13',
          fontFamily: 'Montserrat',
          fontWeight: '500',
          borderRadius: '40px',
          padding: '16px',
          minHeight: '56px',
        },
      })
    }
  }
}

type ErrorMsg = Error | string | string[]

export const toastError = (error: ErrorMsg, delay = 3000) => {
  let toastData: any = ''

  if (typeof error === 'string' || (error && error instanceof Array)) {
    toastData = error
  }

  if (toastData && typeof toastData === 'string' && toastData !== '') {
    if (delay) {
      toast.error(toastData, {
        icon: React.createElement(IconError),
        position: toast.POSITION.TOP_CENTER,
        closeButton: false,
        pauseOnHover: true,
        transition: Flip,
        autoClose: delay,
        style: {
          color: 'white',
          background: '#F95050',
          fontFamily: 'Montserrat',
          fontWeight: '500',
          borderRadius: '40px',
          padding: '16px',
          minHeight: '56px',
        },
      })
    } else {
      toast.error(toastData, {
        icon: React.createElement(IconError),
        position: toast.POSITION.TOP_CENTER,
        closeButton: false,
        pauseOnHover: true,
        transition: Flip,
        autoClose: false,
        style: {
          color: 'white',
          background: '#F95050',
          fontFamily: 'Montserrat',
          fontWeight: '500',
          borderRadius: '40px',
          padding: '16px',
          minHeight: '56px',
        },
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
