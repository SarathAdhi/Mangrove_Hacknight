/* pages/create-nft.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { css } from '@emotion/css'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className={sellPage}>
      <div className={sellPageContainer}>
        <input 
          placeholder="Asset Name"
          className={sellPageInput}
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className={sellPageInput}
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className={sellPageInput}
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className={sellPageInput}
          onChange={onChange}
          style={{color: 'white'}}
          onClick={() => document.getElementById("loading").style.display = "block"}
        />
        <p className={loading} id='loading'>Loading....</p>
        {
          fileUrl && (<img className={uploadedImg} width="350" src={fileUrl} />)
        }
        {
          fileUrl && (document.getElementById('loading').innerHTML="")
        }
        <button onClick={listNFTForSale} className={PostDoc}>
          POST
        </button>
      </div>
    </div>
  )
}

const sellPage = css`
    padding-top: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
`
const sellPageContainer = css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 60%;
`
const sellPageInput = css`
    width: 100%;
    margin: 10px 0px;
    padding: 10px 10px;
    border-radius: 10px;
`
const loading = css`
    display: none;
    color: white;
`
const uploadedImg = css`
    
`
const PostDoc = css`
    margin: 20px 0px;
    padding: 10px 20px;
    border-radius: 5px;
    background-color: #00FF00;
    font-weight: 600;
    transition: all 0.3s ease-in-out;
    :hover {
      border-radius: 15px;
    }
`