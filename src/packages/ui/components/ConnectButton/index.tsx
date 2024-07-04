import { ChevronDownIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Image } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
export const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    fontSize="14px"
                    border="1px solid white"
                    borderRadius="full"
                    bg="white"
                    color="black"
                    pos={{ base: 'fixed', lg: 'unset' }}
                    bottom="40px"
                    left="50%"
                    transform={{ base: 'translateX(-50%)', lg: 'none' }}
                    onClick={openConnectModal}
                    type="button">
                    Connect Wallet
                  </Button>
                )
              }
              if (chain.unsupported) {
                return (
                  <Button
                    fontSize="14px"
                    border="1px solid white"
                    borderRadius="full"
                    color="black"
                    bg="white"
                    onClick={openChainModal}
                    type="button">
                    Wrong network
                  </Button>
                )
              }
              return (
                <Flex
                  pos={{ base: 'fixed', lg: 'unset' }}
                  direction={{ base: 'column', lg: 'row' }}
                  bottom="40px"
                  left="50%"
                  transform={{ base: 'translateX(-50%)', lg: 'none' }}
                  gap="20px">
                  <Button
                    onClick={openChainModal}
                    _hover={{ bg: 'transparent' }}
                    _focus={{ bg: 'transparent' }}
                    display="flex"
                    px="16px"
                    bg="transparent"
                    border="1px solid white"
                    borderRadius="full"
                    gap="8px"
                    fontSize="14px"
                    color="white"
                    alignItems="center">
                    {chain.hasIcon && (
                      <Box>
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            w="16px"
                            h="16px"
                          />
                        )}
                      </Box>
                    )}
                    {chain.name}
                  </Button>
                  <Button
                    _hover={{ bg: 'transparent' }}
                    _focus={{ bg: 'transparent' }}
                    display="flex"
                    px="16px"
                    bg="transparent"
                    border="1px solid white"
                    borderRadius="full"
                    gap="8px"
                    alignItems="center"
                    onClick={openAccountModal}>
                    <Box fontSize="14px" color="white">
                      {account.displayName}
                    </Box>
                    <ChevronDownIcon color="white" />
                  </Button>
                </Flex>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
