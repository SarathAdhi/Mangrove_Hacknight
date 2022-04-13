/* pages/my-nfts.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { css } from '@emotion/css'
import Link from 'next/link';
import Image from 'next/image'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        file: meta.data.file,
        image: meta.data.image,
        tokenURI
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }
  function listNFT(nft) {
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}&price=${nft.price}`)
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)

  return (

    <div className={noNftsHome}>
      {
        nfts.map((nft, i) => (
          <div key={i} className={nftBox}>
            <p className={nftSeller}>Owner: {nft.owner}</p>
            <img className={nftImg} src={nft.image} />
            <p className={nftBoxPrc} id='p_price'>Purchased Price: {nft.price} ETH&nbsp;&nbsp;&nbsp;<Image width={30} height={30} src={require('./assets/etherium.svg')} /></p>
            <a href={nft.file}>Download File</a>
            <button className={lishBtn} onClick={() => listNFT(nft)}>List</button>
          </div>
        ))
      }
    </div>
  )
}

const noNftsHome = css`
    padding-top: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
`
const nftBox = css`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 300px;
  padding: 20px 5px;
  margin: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #282828;
  }
`
const nftSeller = css`
    position: relative;
    font-size: 10px;
`
const nftBoxPrc = css`
  margin-top: 10px;
  color: #ff7324;
  display: flex;
  align-items: center;
`
const nftImg = css`
    width: 95%;
    border-radius: 10px;
    margin-top: 20px;
    margin-bottom: 10px;
`
const lishBtn = css`
    border-radius: 10px;
    margin-top: 10px;
    background-color: white;
    padding: 2px 20px;
    color: black;
`