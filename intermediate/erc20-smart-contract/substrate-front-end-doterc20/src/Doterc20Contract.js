import metadata from './config/doterc20metadata.json';
import { Abi, ContractPromise } from '@polkadot/api-contract';

// NOTE the apps UI specified these in mega units
export const gasLimit = 3000n * 1000000n;
const doterc20ca = '5EUfudyg9K9qF9w4ruLzZgdpwh3pK8GiWmQ4S8Wtr1pd93WH';

export default function DotErc20Contract(api){
    const abi = new Abi(metadata);
    return new ContractPromise(api, abi, doterc20ca);
}

export function balancesDoterc20(balance){
    return `${balance.toString()} DOTERC20`;
}
