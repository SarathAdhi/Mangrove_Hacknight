import crustAuth from "./crustAuth";


// 4. Pin to crust with IPFS standard W3Authed pinning servic
async function crustPinning(cid, name){
    console.log(cid.toV0().toString());
    const ipfsPinningService = 'https://pin.crustcode.com/psa';
    const authHeader = crustAuth();
    const body = await fetch(
            ipfsPinningService + '/pins',
            {
                method: 'POST',
                headers:{
                    'authorization': 'Bearer ' + authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cid: cid.toV0().toString(),
                    name: name
                })
            }
        )
        .then(resp => resp.json())
    console.log(body);
}
// const {body} = await got.post(
//     ipfsPinningService + '/pins',
//     {
//         headers: {
//             authorization: 'Bearer ' + authHeader
//         },
//         json: {
//             cid: cid.toV0().toString(),
//             name: 'crust-demo'
//         }
//     }
// );

export default crustPinning;