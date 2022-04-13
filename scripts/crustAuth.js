const { Keyring } = require('@polkadot/keyring');

const seeds = 'chief roast little cousin remind kitten topic father window zebra term float';

// 2. Construct auth header
function crustAuth(){
    const keyring = new Keyring();
    const pair = keyring.addFromUri(seeds);
    const sig = pair.sign(pair.address);
    const sigHex = '0x' + Buffer.from(sig).toString('hex');
    const authHeader = Buffer.from(`sub-${pair.address}:${sigHex}`).toString('base64');
    return authHeader;
}

export default crustAuth;