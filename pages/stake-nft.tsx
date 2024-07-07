'use client'

import { Box, Button, Flex, Image, Select, Text } from '@chakra-ui/react'
import { ellipseAddress } from '@utils'
import { toastError, toastSuccess, toastWarning } from '@utils/toast'
import { ethers } from 'ethers'
import moment from 'moment'
import useStore from 'packages/store'
import { web3Modal } from 'packages/web3'
import { useEffect, useState } from 'react'

import Footer from '@components/Footer'
import { useRouter } from 'next/router'
import ERC_ABI from 'packages/abis/demo/Erc721.json'
import flABI from 'packages/abis/demo/fl417.json'
import useAuctions from 'packages/store/auctions'

const FL_CONTRACT_ADR: string = process.env
  .NEXT_PUBLIC_FL_CONTRACT_ADR as string
const Register = () => {
  const router = useRouter()

  const [nft, setNFT] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const { address } = useStore()

  const { nftList, auctionInfo, getUserNftList } = useAuctions()

  const [localStaked, setLocalStaked] = useState(false)

  const fetchNFT = async () => {
    if (!address) return
    getUserNftList(address)
  }

  useEffect(() => {
    if (address) {
      fetchNFT()
      if (typeof window !== 'undefined') {
        if (!window.localStorage.getItem('staked')) {
          setLocalStaked(false)
        }
      }
    }
  }, [address])

  const handleRegister = async () => {
    if (!address) return toastWarning('Please connect wallet first')
    if (!nft) return toastError('Please stake NFT')

    try {
      setIsLoading(true)
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()

      const erc_contract = new ethers.Contract(nft.nftAddress, ERC_ABI, signer)

      let gasAmount = await erc_contract.estimateGas.approve(
        FL_CONTRACT_ADR,
        nft.tokenId,
      )
      const approvedAddr = await erc_contract.getApproved(nft.tokenId, {
        gasLimit: gasAmount,
      })

      const isApproved = approvedAddr === FL_CONTRACT_ADR
      if (!isApproved) {
        try {
          const tt = await erc_contract.approve(FL_CONTRACT_ADR, nft.tokenId, {
            gasLimit: gasAmount,
          })
          await tt.wait()
          const contract = new ethers.Contract(FL_CONTRACT_ADR, flABI, signer)

          gasAmount = await contract.estimateGas.newGame(
            nft.nftAddress,
            nft.tokenId,
          )

          try {
            const tx = await contract.newGame(nft.nftAddress, nft.tokenId, {
              gasLimit: gasAmount,
            })
            await tx.wait()

            const gameId = await contract.totalGames()
            const [gameInfos] = await contract.getGameInfoOfGameIds([
              (Number(gameId) - 1).toString(),
            ])
            toastSuccess(
              `You have successfully staked your NFT. Your NFT auction will start on ${moment
                .utc(gameInfos?.startTimestamp)
                .format('MMMM DD ha [UTC]')}`,
            )

            const bidRoundInfo = await contract.bidRoundInfo()
            const bidInfo = ['1', Number(bidRoundInfo.lastBidId)]
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('staked', JSON.stringify(bidInfo))
            }
            setLocalStaked(true)
            // router.push('/')
          } catch (error) {
            console.log(error, 'error')
            toastWarning('The auction has not yet begun, please be patient.')
          }
        } catch (error) {
          console.log('Current NFT Authorization: In Use')
          toastError(error?.message)
        }
      } else {
        const contract = new ethers.Contract(FL_CONTRACT_ADR, flABI, signer)

        gasAmount = await contract.estimateGas.newGame(
          nft.nftAddress,
          nft.tokenId,
        )
        try {
          const tx = await contract.newGame(nft.nftAddress, nft.tokenId, {
            gasLimit: gasAmount,
          })
          await tx.wait()

          const gameId = await contract.totalGames()
          const [gameInfos] = await contract.getGameInfoOfGameIds([
            (Number(gameId) - 1).toString(),
          ])
          toastSuccess(
            `You have successfully staked your NFT. Your NFT auction will start on ${moment
              .utc(gameInfos?.startTimestamp)
              .format('MMMM DD ha [UTC]')}`,
          )

          const bidRoundInfo = await contract.bidRoundInfo()
          const bidInfo = ['1', Number(bidRoundInfo.lastBidId)]
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('staked', JSON.stringify(bidInfo))
          }
          setLocalStaked(true)
          // router.push('/')
        } catch (error) {
          console.log(error, 'error')
          toastError(error?.message)
        }
      }
    } catch (error) {
      console.log(error, 'error')
      toastError(error?.message)
    } finally {
      setIsLoading(false)
    }
  }

  const listStakeNFt = [
    {
      title: 'NFT Owner',
      description: nft?.userAddress
        ? ellipseAddress(nft?.userAddress, 10)
        : '-',
      copyDescription: nft?.userAddress,
    },
    {
      title: 'Contract Address',
      description: nft?.nftAddress ? ellipseAddress(nft?.nftAddress, 10) : '-',
      copyDescription: nft?.nftAddress,
    },
    {
      title: 'Token ID',
      description: nft?.tokenId || '-',
    },
    {
      title: 'Chain',
      description: 'Ethereum',
    },
    {
      title: 'Token Standard',
      description: 'ERC-721',
    },
    {
      title: 'Rarity',
      description: '56%',
    },
    {
      title: 'Auction Duration',
      description: '24 hours',
      detail: 'Extend 30s for each key minted',
    },
    {
      title: 'Auction Opening',
      description:
        moment.utc(auctionInfo?.startTimestamp).format('MMMM DD ha [UTC]') ||
        '--',
    },
    {
      title: 'NFT Provider Dividends',
      description: '50% of key mint fee',
    },

    {
      title: 'Final Winner Prize',
      description: '20% of key mint fee',
    },
    {
      title: 'Key Holder Dividends',
      description: '20% of following key mint fee',
    },
  ]

  return (
    <Box>
      <Flex position="relative" alignItems="center" mb="56px">
        <Flex
          pos="absolute"
          left="68px"
          alignItems="center"
          _hover={{ cursor: 'pointer' }}
          onClick={() => router.back()}>
          <Image
            src="/static/market/left.svg"
            alt="left"
            w="20px"
            h="20px"
            mr="4px"
          />
          <Text fontSize="20px" lineHeight="24px">
            Back
          </Text>
        </Flex>
        <Text w="full" textAlign="center" fontSize="36px" fontWeight="700">
          Stake NFT
        </Text>
      </Flex>
      <Flex justifyContent="center" mb="110px">
        <Flex alignItems="center" gap="60px">
          <Box w={{ base: '180px', md: '220px', xl: '430px' }}>
            <Image
              src={nft?.imageUrl}
              fallbackSrc="/static/account/avatar.svg"
              alt="logo"
              w={{ base: '180px', md: '220px' }}
              h="full"
              borderRadius="15px"
            />
          </Box>

          <Box>
            <Select
              w="460px"
              mb="32px"
              bg="#2F2B50"
              border="none"
              placeholder="Select NFT in Fromo"
              sx={{
                '> option': {
                  background: '#1DFED6',
                },
              }}
              onChange={(e) => setNFT(JSON.parse(e.target.value))}
              h="56px">
              {nftList.map((nft, index) => (
                <option
                  disabled={nft.status === 1}
                  key={index}
                  value={JSON.stringify(nft)}>
                  {nft.name ? nft.name : nft.tokenId}&nbsp;&nbsp; (
                  {nft.status === 1
                    ? 'In Use'
                    : nft.status === 2
                    ? `Auctioned ${nft.auctionsCount} times`
                    : 'Available'}
                  )
                </option>
              ))}
            </Select>
            <Flex direction="column" gap="12px">
              {listStakeNFt.map((i, k) => (
                <Flex alignItems="center" key={k} gap="12px">
                  <Text>{i.title}</Text>
                  <Flex alignItems="center" fontWeight="600">
                    <Box color={k === 0 || k === 1 ? '#1DFED6' : 'white'}>
                      {i.description}
                    </Box>
                    <Image
                      alt=""
                      onClick={() => {
                        navigator.clipboard.writeText(i.copyDescription)
                        toastSuccess('Copied')
                      }}
                      src="/static/common/copy.svg"
                      w="20px"
                      cursor="pointer"
                      h="20px"
                      ml="8px"
                      display={k === 0 || k === 1 ? 'block' : 'none'}
                    />
                    <Box
                      ml="12px"
                      fontSize="14px"
                      color="rgba(255,255,255,0.6)">
                      {i.detail}
                    </Box>
                  </Flex>
                </Flex>
              ))}
            </Flex>
            <Button
              w="168px"
              h="56px"
              fontSize={{ base: '18px', lg: '20px' }}
              lineHeight="30px"
              color="#222222"
              fontWeight="600"
              borderRadius="8px"
              bgColor="#1DFED6"
              mt="32px"
              isLoading={isLoading}
              disabled={!nft || localStaked}
              onClick={() => {
                if (nft && !localStaked) {
                  handleRegister()
                }
              }}>
              Stake
            </Button>
          </Box>
        </Flex>
      </Flex>
      <Footer />
    </Box>
  )
}

export default Register
