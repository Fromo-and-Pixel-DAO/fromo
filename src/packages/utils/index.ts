import moment, { Moment } from 'moment'
import { LICENSE_DURATION_CONVERT } from 'packages/constants'
import Web3 from 'web3'

import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { formatFixed, parseFixed } from "@ethersproject/bignumber"

import { ErrorMetamask } from '@ts'
import { logger } from 'ethers/lib/ethers'

const names = [
  "wei",
  "kwei",
  "mwei",
  "gwei",
  "szabo",
  "finney",
  "ether",
]

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function timeFromNow(end: Moment, withoutSuffix = true) {
  return moment(end).fromNow(withoutSuffix)
}

export function weiToEtherString(wei: string, unit?: string) {
  if (!wei) return '--'
  const roundUpDigits = 3
  const ether: any = Web3.utils.fromWei(wei, 'Gwei')
  const roundedEther =
    Math.ceil(ether * Math.pow(10, roundUpDigits)) /
    (Math.pow(10, roundUpDigits) * 1.0)
  return roundedEther
}

export function convertUrlImage(url: string) {
  if (url) {
    const convertUrl = url?.includes('https://')
      ? url
      : url?.replace('ipfs://', 'https://ipfs.io/ipfs/')

    return convertUrl
  }
  return '/static/license-template/template.png'
}

export function ellipseAddress(address = '', width = 6): string {
  if (!address) {
    return '--'
  }
  return `${address.slice(0, width)}...${address.slice(-width)}`
}

export function getTitleErrorMetamask(error: any) {
  const titleError =
    error?.code === ErrorMetamask.ACTION_REJECTED
      ? 'User rejected transaction'
      : error?.error?.message

  return titleError
}

export const validVideoUrl = (url: string): boolean => {
  const regex = /\S+(\.mp4|\.mkv|\.avi)/g.test(url || '')
  if (!regex) {
    return false
  }
  return true
}

export const getColorTab = (duration: string) => {
  switch (duration) {
    case 'a few seconds':
      return 'green'

    case 'a minute':
      return 'yellow'

    case 'a month':
      return 'linkedin'

    case '3 months':
      return 'whatsapp'

    case '6 months':
      return 'orange'

    case '1 year':
      return 'whatsapp'

    default:
      return 'steal'
  }
}

export function generateTimeString(sec_num = 0): string {
  if (sec_num < 0) {
    sec_num = 0
  }
  const hours = Math.floor(sec_num / 3600)
  const minutes = Math.floor((sec_num - hours * 3600) / 60)
  const seconds = sec_num - hours * 3600 - minutes * 60
  let hourStr = hours.toString()
  let minStr = minutes.toString()
  let secStr = seconds.toString()
  if (hours < 10) {
    hourStr = '0' + hours
  }
  if (minutes < 10) {
    minStr = '0' + minutes
  }

  return hourStr + ' hour(s) ' + minStr + ' minute(s)'
}

export function convertValidDurationToString(validDuration = 0): string {
  const getLicenseDuration = LICENSE_DURATION_CONVERT.filter(
    (item) => item.value === validDuration,
  )
  return getLicenseDuration[0]?.name
}

export function convertDurationToValue(expDuration = ''): number {
  const getLicenseDuration = LICENSE_DURATION_CONVERT.filter(
    (item) => item.expDuration === expDuration,
  )
  return getLicenseDuration[0]?.value
}

export function removeDuplicate(array): string[] {
  const uniqueArray = array.filter(function (item, pos) {
    return array.indexOf(item) == pos
  })

  return uniqueArray
}


export function formatUnits(value: BigNumberish, unitName?: string | BigNumberish): string {
  if (typeof (unitName) === "string") {
    const index = names.indexOf(unitName)
    if (index !== -1) { unitName = 3 * index }
  }
  return formatFixed(value, (unitName != null) ? unitName : 18)
}

export function parseUnits(value: string, unitName?: BigNumberish): BigNumber {
  if (typeof (value) !== "string") {
    logger.throwArgumentError("value must be a string", "value", value)
  }
  if (typeof (unitName) === "string") {
    const index = names.indexOf(unitName)
    if (index !== -1) { unitName = 3 * index }
  }
  return parseFixed(value, (unitName != null) ? unitName : 18)
}

export function formatEther(wei: BigNumberish): string {
  return formatUnits(wei, 18)
}

export function parseEther(ether: string): BigNumber {
  return parseUnits(ether, 18)
}


export function formatNumberWithCommas(num: number): string {
  if (!num) return '0'

  if (typeof num === 'string') {
    num = parseFloat(num)
  }
  // eg: 10000 to "10,000"
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
