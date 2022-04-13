/* pages/resell-nft.js */
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { css } from '@emotion/css'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  async function listNFTForSale() {
    if (!price) return
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className={listNfts}>
      <div className={listNftsContainer}>
        <input
        type='number'
          placeholder="Asset Price in Eth"
          className={sellNftInput}
          onChange={e => {
            updateFormInput({ ...formInput, price: e.target.value });
            var val = e.target.value - router.query.price;
            console.log(val)
            if(e.target.value >= router.query.price)
              document.getElementById("profit-loss").innerHTML = val+" Ethers Profit";
            if(e.target.value < router.query.price)
              document.getElementById("profit-loss").innerHTML = val+" Ethers Loss";
            
          }}
        />
        <p id='profit-loss'  className={pTag}></p>
        {
          image && (
            <img className="rounded mt-4" width="350" src={image} />
          )
        }
        <button onClick={listNFTForSale} className={buyNftBtn}>
          ReSell
        </button>
      </div>
    </div>
  )
}

const listNfts = css`
  padding-top: 200px;
  display: flex;
  justify-content: center;
`

const listNftsContainer = css`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`
const buyNftBtn = css`
  margin-top: 20px;
  background: rgb(45, 129, 255);;
  padding: 5px 15px;
  border: 2px solid #111;
  border-radius: 10px;
  margin-bottom: 20px;
`
const sellNftInput = css`
    width: 100%;
    margin: 10px 0px;
    padding: 10px 10px;
    border-radius: 10px;
`
const pTag = css`
    color: white;
`