import {
  Box,
  Button,
  Flex,
  Image,
  Select,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { ellipseAddress } from '@utils'
import { toastError, toastSuccess, toastWarning } from '@utils/toast'
import { ethers } from 'ethers'
import moment from 'moment'
import useStore from 'packages/store'
import { web3Modal } from 'packages/web3'
import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import ERC_ABI from 'packages/abis/demo/Erc721.json'
import flABI from 'packages/abis/demo/fl417.json'
import useAuctions from 'packages/store/auctions'

const FL_CONTRACT_ADR = process.env.NEXT_PUBLIC_FL_CONTRACT_ADR
const ERC_NFT = process.env.NEXT_PUBLIC_ERC_NFT

const NFT_ID = 29 // 28-35

const Register = () => {
  const router = useRouter()

  // const [nftList, setNftList] = useState([])
  const [nft, setNFT] = useState(null)

  const [isLoading, setIsLoading] = useState(false)

  const { address } = useStore()

  const { nftList, auctionInfo, getUserNftList } = useAuctions()

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()

  const fetchNFT = async () => {
    if (!address) return
    getUserNftList(address)
    // const data = await http.get<any>(`https://api.opensea.io/api/v2/chain/ethereum/account/${NFT_ADDRESS}/nfts`, {
    //     headers: {
    //         "x-api-key": process.env.NEXT_PUBLIC_NFT_KEY
    //     }
    // })
    // setNftList(data.nfts)
  }

  // TODO：1. 未登录的时候 逻辑判断；2. NFT 搜索框 不是下拉框
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

      const erc_contract = new ethers.Contract(ERC_NFT, ERC_ABI, signer)

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
        } catch (error) {
          console.log('Current NFT Authorization: In Use')
        }
      }

      const contract = new ethers.Contract(FL_CONTRACT_ADR, flABI, signer)

      try {
        const tx = await contract.newGame(ERC_NFT, nft.tokenId, {
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
      console.log(error, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Box p="24px 42px" pb="200px">
        <Flex _hover={{ cursor: 'pointer' }} onClick={() => router.back()}>
          <Image
            src="/static/market/left.svg"
            alt="left"
            w="24px"
            h="24px"
            mr="16px"></Image>
          <Text fontSize="20px" lineHeight="24px">
            Back
          </Text>
        </Flex>
        <Box
          m="16px auto"
          w="1280px"
          p="48px"
          border="1px solid #704BEA"
          borderRadius="20px">
          <Text fontSize="24px" lineHeight="36px" fontWeight="700" mb="40px">
            Stake NFT
          </Text>
          <Box ml="174px">
            <Flex align="center" h="52px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Stake NFT
              </Text>
              <Select
                w="400px"
                backdropBlur="5px"
                placeholder="Select Nft in Fromo"
                sx={{
                  '> option': {
                    background: '#2A0668',
                  },
                }}
                _focusVisible={{
                  borderColor: '#704BEA',
                }}
                onChange={(e) => setNFT(JSON.parse(e.target.value))}
                borderColor="#704BEA"
                h="52px">
                {nftList.map((nft, index) => (
                  <option
                    disabled={nft.status === 1}
                    key={index}
                    value={JSON.stringify(nft)}>
                    {nft.name ? nft.name : nft.tokenId}&nbsp;&nbsp; (
                    {nft.status === 1
                      ? 'In Use'
                      : nft.status === 2
                      ? `Auctioned ${nft.auctionCount} times`
                      : 'Available'}
                    )
                  </option>
                ))}
              </Select>
            </Flex>
            {nft && (
              <Flex align="center" mb="20px" mt="20px">
                <Text
                  mr="44px"
                  textAlign="right"
                  color="rgba(255, 255, 255, 0.7)"
                  fontSize="16px"
                  lineHeight="18px"
                  w="180px"></Text>
                <Image
                  src={nft?.imageUrl}
                  fallbackSrc="/static/account/avatar.png"
                  alt="logo"
                  w="400px"
                  h="400px"
                  borderRadius="15px"></Image>
              </Flex>
            )}
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                NFT Owner
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                {nft ? ellipseAddress(nft?.userAddress, 10) : '-'}
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Contract Address
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                {ellipseAddress(nft?.nftAddress, 10) || '-'}
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Token ID
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                {nft?.tokenId || '-'}
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Token Standard
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                ERC-721
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Chain
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                Ethereum
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Auction Duration
              </Text>
              <Flex
                align="baseline"
                fontSize="16px"
                lineHeight="24px"
                color="#fff">
                24 hours{' '}
                <Text
                  ml="10px"
                  fontSize="14px"
                  color="rgba(255, 255, 255, 0.5)">
                  extend 30s for each key minted
                </Text>
              </Flex>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Auction Opening
              </Text>
              {/* <Text fontSize="16px" lineHeight="24px" color="#fff">{genDate().format("MMMM DD [at] h [p.m.] [PST]")}</Text> */}
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                {moment(auctionInfo?.startTimestamp).format(
                  'MMMM DD ha [GMT]',
                ) || '--'}
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                NFT Provider Dividends
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                50% of key mint fee
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Final Winner Prize
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                20% of key mint fee
              </Text>
            </Flex>
            <Flex align="center" h="52px" mb="20px">
              <Text
                mr="44px"
                textAlign="right"
                color="rgba(255, 255, 255, 0.7)"
                fontSize="16px"
                lineHeight="18px"
                w="180px">
                Key Holder Dividends
              </Text>
              <Text fontSize="16px" lineHeight="24px" color="#fff">
                20% of following key mint fee
              </Text>
            </Flex>
          </Box>
        </Box>
      </Box>
      <Box pos="fixed" bottom={0} bg="rgba(112, 75, 234,0.89)">
        <Box
          mt="32px"
          mb="25px"
          w="100vw"
          height="1px"
          bg="rgba(112, 75, 234, 0.5)"></Box>
        <Flex w="1280px" m="0 auto" mb="30px" justifyContent="end">
          <Button
            isLoading={isLoading}
            w="272px"
            h="52px"
            fontSize="20px"
            lineHeight="30px"
            color="#000"
            fontWeight="700"
            borderRadius="10px"
            bgColor="#00DAB3"
            onClick={handleRegister}>
            Stake
          </Button>
        </Flex>
      </Box>
    </>
  )
}

export default Register
