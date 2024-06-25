import {
  Box,
  Button,
  Flex,
  Image,
  Select,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import { ellipseAddress } from '@utils'
import { toastError, toastSuccess, toastWarning } from '@utils/toast'
import { ethers } from 'ethers'
import moment from 'moment'
import useStore from 'packages/store'
import { web3Modal } from 'packages/web3'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'
import ERC_ABI from 'packages/abis/demo/Erc721.json'
import flABI from 'packages/abis/demo/fl417.json'
import useAuctions from 'packages/store/auctions'

const FL_CONTRACT_ADR: string = process.env
  .NEXT_PUBLIC_FL_CONTRACT_ADR as string
const Register = () => {
  const router = useRouter()

  const [nft, setNFT] = useState(null)
  const { onCopy, setValue } = useClipboard('')

  const [isLoading, setIsLoading] = useState(false)
  const { address } = useStore()

  const { nftList, auctionInfo, getUserNftList } = useAuctions()

  const fetchNFT = async () => {
    if (!address) return
    getUserNftList(address)
  }

  useEffect(() => {
    fetchNFT()
  }, [])

  const handleRegister = async () => {
    if (!address) return toastWarning('Please connect wallet first')
    if (!nft) return toastError('Please stake NFT')

    try {
      setIsLoading(true)
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()

      const erc_contract = new ethers.Contract(nft.nftAddress, ERC_ABI, signer)

      const approvedAddr = await erc_contract.getApproved(nft.tokenId, {
        gasLimit: BigInt(500000),
      })

      const isApproved = approvedAddr === FL_CONTRACT_ADR
      if (!isApproved) {
        try {
          const tt = await erc_contract.approve(FL_CONTRACT_ADR, nft.tokenId, {
            gasLimit: BigInt(500000),
          })
          await tt.wait()
          const contract = new ethers.Contract(FL_CONTRACT_ADR, flABI, signer)

          try {
            const tx = await contract.newGame(nft.nftAddress, nft.tokenId, {
              gasLimit: BigInt(500000),
            })
            await tx.wait()

            const gameId = await contract.totalGames()
            const [gameInfos] = await contract.getGameInfoOfGameIds([
              (Number(gameId) - 1).toString(),
            ])
            toastSuccess(
              `You have successfully staked your NFT. Your NFT auction will start on ${moment(
                gameInfos?.startTimestamp,
              ).format('MMMM DD ha [GMT]')}`,
            )
            router.back()
          } catch (error) {
            console.log(error, 'error')
            toastWarning('The auction has not yet begun, please be patient.')
          }
        } catch (error) {
          console.log('Current NFT Authorization: In Use')
          toastError('You  Failed to approve NFT due to some error.', 2000)
        }
      } else {
        const contract = new ethers.Contract(FL_CONTRACT_ADR, flABI, signer)

        try {
          const tx = await contract.newGame(nft.nftAddress, nft.tokenId, {
            gasLimit: BigInt(500000),
          })
          await tx.wait()

          const gameId = await contract.totalGames()
          const [gameInfos] = await contract.getGameInfoOfGameIds([
            (Number(gameId) - 1).toString(),
          ])
          toastSuccess(
            `You have successfully staked your NFT. Your NFT auction will start on ${moment(
              gameInfos?.startTimestamp,
            ).format('MMMM DD ha [GMT]')}`,
          )
          router.back()
        } catch (error) {
          console.log(error, 'error')
          toastError('You Failed to stake NFT due to some error.', 2000)
        }
      }
    } catch (error) {
      console.log(error, 'error')
      toastError('You Failed to stake NFT due to some error.', 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const listStakeNFt = [
    {
      title: 'NFT Owner',
      description: nft ? ellipseAddress(nft?.userAddress, 10) : '-',
    },
    {
      title: 'Contract Address',
      description: ellipseAddress(nft?.nftAddress, 10) || '-',
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
        moment(auctionInfo?.startTimestamp).format('MMMM DD ha [GMT]') || '--',
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
    <>
      <Flex p={{ base: '16px', lg: '24px 42px' }} pb="200px">
        <Flex
          ml="20px"
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
        <Box>
          <Text textAlign="center" fontSize="36px" fontWeight="700" mb="56px">
            Stake NFT
          </Text>
          <Flex alignItems="center" gap="60px">
            <Box w={{ base: '180px', md: '220px', xl: '430px' }}>
              <Image
                src={nft?.imageUrl}
                fallbackSrc="/static/account/avatar.png"
                alt="logo"
                w={{ base: '180px', md: '220px', xl: '430px' }}
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
                      <Box
                        onChange={() => {
                          setValue(i.description)
                        }}
                        color={k === 0 || k === 1 ? '#1DFED6' : 'white'}></Box>
                      <Image
                        alt=""
                        onClick={() => {
                          onCopy()
                          toastSuccess('Copied', 2000)
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
                onClick={handleRegister}>
                Stake
              </Button>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

export default Register
