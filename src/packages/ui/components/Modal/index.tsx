import {
  Box,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useMediaQuery,
} from '@chakra-ui/react'

import { Themes } from '@ts'

type ModalProps = {
  typeModal?: Themes
  isOpen: boolean
  title?: JSX.Element
  size?: object | string
  children?: JSX.Element
  buttons?: JSX.Element
  onClose?: () => void
  isCloseBtn?: boolean
  bgColor?: string
  color?: string
  bgImage?: string
  variant?: string
}

export default function BaseModal({
  typeModal = Themes.PRIMARY,
  isOpen,
  onClose,
  children,
  title,
  size,
  variant,
  buttons,
  bgColor,
  color,
  isCloseBtn = true,
}: ModalProps) {
  const [isLargerThan768] = useMediaQuery('(min-width: 769px)')
  if (typeModal === Themes.SUCCESS_PRIMARY) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={size}
        isCentered
        variant={variant}>
        <ModalOverlay
          bg="rgba(19, 2, 48, 0.8)"
          boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
          backdropFilter="blur(5px)"
        />
        <ModalContent
          css={{
            backgroundImage:
              'linear-gradient( #774af2 , #9b4dee  ),url(/static/modals/bg_success.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
          color={color}>
          {isCloseBtn && <ModalCloseButton color="#fff" zIndex={2} />}
          <ModalBody p="0px" color={color}>
            {children}
            <Image
              position="absolute"
              top={{ base: '65%', md: '38px' }}
              left={{ base: '-5%', md: '-90px' }}
              alt="image"
              src={
                isLargerThan768
                  ? '/static/modals/ball_success_modal.png'
                  : '/static/modals/ball_success_modal_mobile.png'
              }
            />
            <Image
              position="absolute"
              right={{ base: '-11%', md: '-115px' }}
              bottom={{ base: 'unset', md: '10px' }}
              top={{ base: '49%', md: 'unset' }}
              rotate={{ base: '48deg', md: 'unset' }}
              alt="image"
              src={
                isLargerThan768
                  ? '/static/modals/ball_success_modal2.png'
                  : '/static/modals/ball_success_modal2_mobile.png'
              }
            />
          </ModalBody>

          <ModalFooter m="0 auto">{buttons}</ModalFooter>
        </ModalContent>
      </Modal>
    )
  }
  if (typeModal === Themes.SUCCESS_SECONDARY) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={size}
        isCentered
        variant={variant}>
        <ModalOverlay
          bg="rgba(19, 2, 48, 0.8)"
          boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
          backdropFilter="blur(5px)"
        />
        <ModalContent
          pos="relative"
          zIndex="1"
          css={{
            backgroundImage:
              'linear-gradient( #774af2 , #9b4dee  ),url(/static/modals/bg_success.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
          color={color}>
          {isCloseBtn && <ModalCloseButton color="#fff" />}
          <ModalBody p="0px" color={color}>
            {children}
            <Image
              zIndex={0}
              position="absolute"
              // transform="rotate(83.27deg)"
              top="-48px"
              left="-70px"
              alt="image"
              src="/static/modals/ball_success_modal3.png"
            />
            <Image
              position="absolute"
              top="28px"
              left="-30px"
              alt="image"
              src="/static/modals/coin_image1.png"
            />
            <Image
              position="absolute"
              top="-50px"
              right="185px"
              alt="image"
              src="/static/modals/coin_image2.png"
            />
            <Image
              position="absolute"
              bottom="-58px"
              left="125px"
              alt="image"
              src="/static/modals/coin_image3.png"
            />

            <Image
              position="absolute"
              bottom="-120px"
              right="-120px"
              alt="image"
              src="/static/modals/ball_success_modal4.png"
            />
            <Image
              position="absolute"
              bottom="-60px"
              right="-30px"
              alt="image"
              src="/static/modals/minion_modal_image.png"
            />
          </ModalBody>

          <ModalFooter m="0 auto">{buttons}</ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={size}
        isCentered
        variant={variant}>
        <ModalOverlay
          bg="rgba(19, 2, 48, 0.8)"
          boxShadow="0px 4px 4px rgba(0, 0, 0, 0.25)"
          backdropFilter="blur(5px)"
        />
        <ModalContent bgColor={bgColor} color={color} borderRadius="16px">
          <Box>
            <ModalHeader
              textAlign="center"
              sx={{
                px: 0,
              }}>
              {title}
            </ModalHeader>
            {isCloseBtn && (
              <ModalCloseButton
                size="4xl"
                color="#606062"
                pos="absolute"
                top="18px"
                right="24px"
              />
            )}
            <ModalBody p="0px" color={color}>
              {children}
            </ModalBody>

            <ModalFooter px="0px" display="flex" justifyContent="center">
              {buttons}
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
  )
}
