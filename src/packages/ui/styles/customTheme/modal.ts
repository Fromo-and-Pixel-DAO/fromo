import { modalAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyle = definePartsStyle({
  // define the part you're going to style
  dialog: {
    padding: [
      '40px 20px 35px',
      '40px 20px 35px',
      '40px 40px 35px',
      '40px 40px 35px',
    ], //change the background
  },
})

const offer = definePartsStyle({
  dialog: {
    padding: ['25px 15px', '25px 30px', '25px 50px', '25px 70px'],
  },
})

const offerSuccess = definePartsStyle({
  dialog: {
    padding: ['25px 15px', '25px 30px', '25px 36px'],
  },
})

const submitOffer = definePartsStyle({
  dialog: {
    padding: '25px 71px 35px',
  },
})

const redeemModal = definePartsStyle({
  dialog: {
    padding: '32px 40px 40px',
  },
})

const redeemModalMobile = definePartsStyle({
  dialog: {
    padding: '32px 20px 20px',
  },
})

const upgradeModal = definePartsStyle({
  dialog: {
    padding: '40px 30px',
  },
})

const bidModal = definePartsStyle({
  dialog: {
    padding: '60px 40px 8px 40px',
  },
})

const bidModalMobile = definePartsStyle({
  dialog: {
    padding: '32px 20px 8px 20px',
  },
})

export const modalTheme = defineMultiStyleConfig({
  variants: {
    offer,
    submitOffer,
    upgradeModal,
    offerSuccess,
    redeemModal,
    redeemModalMobile,
    bidModal,
    bidModalMobile,
  },
  baseStyle,
})
