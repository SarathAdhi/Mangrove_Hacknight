import { useRouter } from "next/router";
import { css } from '@emotion/css'
import Image from 'next/image'

export default function DisplayNFT() {
  const router = useRouter();
  const query = router.query;
  var data = query;

  return (
    <div className={displayNft}>
      <img className={nftImg} src={data.img} />
      <div className={displayNftRight}>
        <h1 className={h1}>{data.name}</h1>
        <h1 className={seller}>Creator: {data.seller}</h1>
        <h1 className={description}>{data.description}</h1>
        <h1 className={price}>{data.price} ETH&nbsp;<Image width={30} height={40} src={require('./assets/eth-icon.png')} /></h1>
        {/* <button className={buyNftBtn} onClick={() => buyNft(data.nft)}>Buy Now</button> */}
      </div>
    </div>
  )
}

const displayNft = css`
  padding-top: 150px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  color: white;
  margin: 0px 50px;
`
const nftImg = css`
  width: 600px;
`
const h1 = css`
  margin-bottom: 20px;
  text-align: center;
  font-size: 40px;
`
const description = css`
  margin-bottom: 20px;
  text-align: center;
  font-size: 15px;
`
const seller = css`
  margin-bottom: 20px;
  text-align: center;
  font-size: 20px;
  color: #ff7324;
`
const price = css`
  margin-top: 20px;
  font-size: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
`
const displayNftRight = css`
  ${'' /* background-color: white; */}
  width: 700px;
`
const buyNftBtn = css`
  margin-top: 20px;
  background: rgb(45, 129, 255);;
  padding: 5px 15px;
  border: 2px solid #111;
  border-radius: 10px;
  margin-bottom: 20px;
`