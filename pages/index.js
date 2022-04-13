/* pages/index.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { css } from '@emotion/css'
import Image from 'next/image'

import {
  marketplaceAddress
} from '../config'
import Link from 'next/link';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className={noNftsHome}>No items in marketplace</h1>)
  return (
    <div className={home}>
      <div className={displayNft}>
        <div className={displayNftContainer}>
          {
            nfts.map((nft, i) => (

              <div key={i} className={nftBox}>
                <p className={nftSeller}>Creator: {nft.seller}</p>
                <img className={nftImg} src={nft.image} />
                {/* <p className="">Seller: {nft.seller}</p> */}
                <p className={nftBoxName}>{nft.name}</p>
                {/* <p className={nftBoxDes}>{nft.description}</p> */}
                <p className={nftBoxPrc}>{nft.price} ETH&nbsp;&nbsp;&nbsp;<Image width={30} height={30} src={require('./assets/etherium.svg')} /></p>
                <button className={buyNftBtn} onClick={() => buyNft(nft)}>Buy Now</button>
                <Link
                  href={{
                    pathname: "/display-nft",
                    query: {
                      img: nft.image,
                      name: nft.name,
                      description: nft.description,
                      price: nft.price,
                      seller: nft.seller,
                    }
                  }}>View More</Link>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

const noNftsHome = css`
    color: white;
    padding-top: 140px;
    text-align: center;
    font-size: 30px;
`
const home = css`
    padding-top: 140px;
`
const displayNft = css`
    width: 100%;
`
const displayNftContainer = css`
    display: flex;
    justify-contents: center;
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
    font-size: 10px;
`

const nftBoxName = css`
  font-size: 30px;
  font-weight: 600;
`
const nftBoxPrc = css`
  margin-top: 10px;
  color: #ff7324;
  display: flex;
  align-items: center;
`
const buyNftBtn = css`
  margin-top: 20px;
  background: rgb(45, 129, 255);;
  padding: 5px 15px;
  border: 2px solid #111;
  border-radius: 10px;
  margin-bottom: 20px;
`
const nftImg = css`
    width: 95%;
    border-radius: 10px;
    margin-top: 20px;
    margin-bottom: 10px;
`