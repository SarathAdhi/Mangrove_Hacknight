/* pages/create-nft.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

import crustAuth from '../scripts/crustAuth';
import crustPinning from '../scripts/crustPinning';
import placeStorageOrder from '../scripts/placeStorageOrder';

import { css } from '@emotion/css'

const authHeader = crustAuth();

const client = ipfsHttpClient({
  // url:'https://ipfs.infura.io:5001/api/v0',
  url: 'https://crustipfs.xyz',
  headers: {
    authorization: `Basic ${authHeader}`
  }
});

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
// import { url } from 'inspector'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [fileCid, setFileCid] = useState(null)
  const [fileSize, setFileSize] = useState(null)
  const [coverImageUrl, setCoverImageUrl] = useState(null)
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
      const cid = added.cid;
      setFileCid(cid);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)

      console.log("------------FILESTAT-------------");
      const fileStat = await client.files.stat("/ipfs/" + added.path);
      console.log(fileStat);
      setFileSize(fileStat.cumulativeSize);
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function onChangeCoverImage(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const cid = added.cid;
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setCoverImageUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl || !fileCid) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name, description, file: fileUrl, image: coverImageUrl
    })
    try {
      await crustPinning(fileCid, name);
      await placeStorageOrder(fileCid, fileSize);
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
        <div style={{color: 'white'}}>Cover Image</div>
        <input
          type="file"
          name="Asset"
          className={sellPageInput}
          onChange={onChangeCoverImage}
          style={{color: 'white'}}
          />
          {
            coverImageUrl && (<img className={uploadedImg} width="350" src={coverImageUrl} />)
          }
        <div style={{color: 'white'}}>File</div>
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