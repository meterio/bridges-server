import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { Chain } from "@defillama/sdk/build/general";
import { getTxDataFromEVMEventLogs, makeTxHashesUnique } from "../../helpers/processTransactions";
import { ethers } from "ethers";
import { constructTransferParams } from "../../helpers/eventParams";

const nullAddress = "0x0000000000000000000000000000000000000000";
const ampl = "0xD46bA6D942050d489DBd938a2C909A5d5039A161";
const amplVault = "0x805c7Ecba41f9321bb098ec1cf31d86d9407de2F"


const contractAddresses = {
  ethereum: {
    ERC20Handler: "0xEa31ca828F53A41bA2864FA194bb8A2d3f11C0C0",
    tokens: [
      "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
      "0xcf3c8be2e2c42331da80ef210e9b1b307c03d36a",
      "0xac0104cca91d167873b8601d2e71eb3d4d8c33e0",
      "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F",
      "0xd478161c952357f05f0292b56012cd8457f1cfbf",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "0xabe580e7ee158da464b51ee1a83ac0289622e6be",
      "0xa58a4f5c4Bb043d2CC1E170613B74e767c94189B",
      "0x0Def8d8addE14c9eF7c2a986dF3eA4Bd65826767"
    ],
  },
  bsc: {
    ERC20Handler: "0x83354D47379881e167F7160A80dAC8269Fe946Fa",
    tokens: [
      "0xDB021b1B247fe2F1fa57e0A87C748Cc1E321F07F",
      "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      "0xbcf39F0EDDa668C58371E519AF37CA705f2bFcbd",
      "0x27d72484f1910F5d0226aFA4E03742c9cd2B297a",
      "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F",
      "0xe138c66982Fd5c890c60b94FDBa1747faF092c20"
    ],
  },
  moonriver: {
    ERC20Handler: "0xB1eFA941D6081afdE172e29D870f1Bbb91BfABf7",
    tokens: [
      "0xCb4a593ce512D78162C58384f0b2Fd6e802c2c47",
      "0xaBD347F625194D8e56F8e8b5E8562F34B6Df3469",
      "0x6fc9651f45B262AE6338a701D563Ab118B1eC0Ce",
      "0x0B5B9806b1B202e22aA26Cfd527fDCafEF9eDAcf",
      "0x59A1B7B7469b968eb051f6c71512d2B61F27794d",
      "0xdf1380A3Ade5F398c9233f36aD6fD0d88AEa9e51",
      "0x5c22ba65F65ADfFADFc0947382f2E7C286A0Fe45",
      "0x1e24EC84F66cd26Dad607d81796DbeB13Cb22692",
      "0x8b29344f368b5FA35595325903fE0eAab70C8E1F",
      "0xbD90A6125a84E5C512129D622a75CDDE176aDE5E",
      "0x7B37d0787A3424A0810E02b24743a45eBd5530B2",
      "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
      "0x3674D64AaB971aB974B2035667a4B3d09B5ec2B3",
      "0xff0bb979035Bc622f01062F37E2BaD4a05B31D83",
      "0xE6a991Ffa8CfE62B0bf6BF72959A3d4f11B2E0f5",
      "0x6b35140fcc6e502a7e1edAC6E740513f41c4b5ec"
    ],
  },
  meter: {
    ERC20Handler: "0x139d9b458acda76457dd99db3a6a36ca9cb3bbf1",
    tokens: [
      "0x1cf09D1B5Da9d9d24365D87B932A7c4bD018A419",
      "0xF0E86246519Be0810C9FAfc8430C49799985aAA8",
      "0x24aA189DfAa76c671c279262F94434770F557c35",
      "0x983147FB73A45FC7F8B4DFA1cd61Bdc7b111e5b6",
      "0x6CFe9AdaD5215195c1Aa9755DAed29360e6Ab986",
      "0xb158870beB809Ad955Bf56065C5C10D7Fd957cC0",
      "0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3",
      "0xd5e615BB3c761AB4cD9251dEEd78Dac58BE9CcBF",
      "0x75Fd6F7EDCc5E7A8100eAd3D29CCD844153ef0F3",
      "0xd86e243fc0007e6226b07c9a50c9d70d78299eb5",
      "0x5Fa41671c48e3C951AfC30816947126CCC8C162e",
      "0x8Df95e66Cb0eF38F91D2776DA3c921768982fBa0",
      "0xc1f6C86ABEe8e2e0B6fd5BD80F0b51fef783635C"
    ],
  },
  theta: {
    ERC20Handler: "0xe1c892A6cE33cB31c100369aA6fC302d7B96254a",
    tokens: [
      "0x7B37d0787A3424A0810E02b24743a45eBd5530B2",
      "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F",
      "0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03",
      "0x3Ca3fEFA944753b43c751336A5dF531bDD6598B6",
      "0x3c751Feb00364CA9e2d0105c40F0b423abf1DEE3",
      "0xE6a991Ffa8CfE62B0bf6BF72959A3d4f11B2E0f5",
      "0xae6f0539e33f624ac685cce9ba57cc1d948d909d",
      "0xf64FA5155D8cc578D473A21FB67507DDCbB80D21"
    ],
  },
  avax: {
    ERC20Handler: "0xeB06fa7e1d400caa3D369776Da45EbB5EbDF9b5B",
    tokens: [
      "0x027dbcA046ca156De9622cD1e2D907d375e53aa7"
    ],
  },
  moonbeam: {
    ERC20Handler: "0x766E33b910Cd6329a0cBD5F72e48Ec162E38A25D",
    tokens: [
      "0x4EdF8E0778967012D46968ceadb75436d0426f88",
      "0x7B37d0787A3424A0810E02b24743a45eBd5530B2",
      "0x1aBB8FdE5e64be3419FceF80df335C68dD2956C7",
      "0xAcc15dC74880C9944775448304B263D191c6077F",
      "0xB60590313975f0d98821B6Cab5Ea2a6d9641D7B6",
      "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F",
      "0x8b29344f368b5FA35595325903fE0eAab70C8E1F",
      "0x4bDE98731149093a12579D71338fd3741fe6E5Ce",
      "0x89C36bB2E30efCA78bDEB99101C1Ac1FfcB6a30e",
      "0x3c751Feb00364CA9e2d0105c40F0b423abf1DEE3",
      "0xE6a991Ffa8CfE62B0bf6BF72959A3d4f11B2E0f5",
      "0xf64FA5155D8cc578D473A21FB67507DDCbB80D21"
    ],
  },
  polygon: {
    ERC20Handler: "0xeB06fa7e1d400caa3D369776Da45EbB5EbDF9b5B",
    tokens: [
      "0xf305012ea754252184f1071c86ae99fac5b40320",
      "0x3Ca3fEFA944753b43c751336A5dF531bDD6598B6"
    ],
  },
} as {
  [chain: string]: {
    ERC20Handler: string;
    tokens: string[];
  };
};

const depositParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), null, ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    from: "from",
    amount: "value",
  },
  fixedEventData: {
    token: "",
  },
  filter: {
    includeTxData: [{ to: "" }],
  },
  isDeposit: true,
};

const withdrawalParams: PartialContractEventParams = {
  target: "",
  topic: "Transfer(address,address,uint256)",
  topics: [ethers.utils.id("Transfer(address,address,uint256)"), ethers.utils.hexZeroPad(nullAddress, 32)],
  abi: ["event Transfer(address indexed from, address indexed to, uint256 value)"],
  logKeys: {
    blockNumber: "blockNumber",
    txHash: "transactionHash",
  },
  argKeys: {
    to: "to",
    amount: "value",
  },
  fixedEventData: {
    token: "",
    from: "",
  },
  filter: {
    includeTxData: [{ to: "" }],
  },
  isDeposit: false,
};

const constructParams = (chain: string) => {
  let eventParams = [] as any;
  const tokens = contractAddresses[chain].tokens;
  const gateway = contractAddresses[chain].ERC20Handler;

  tokens.map((address) => {
    const finalDepositParams = {
      ...depositParams,
      target: address,
      fixedEventData: {
        token: address,
        to: gateway,
      },
      filter: {
        includeTxData: [{ to: gateway }],
      },
    };
    const finalWithdrawalParams = {
      ...withdrawalParams,
      target: address,
      fixedEventData: {
        token: address,
        from: gateway,
      },
      filter: {
        includeTxData: [{ to: gateway }],
      },
    };
    eventParams.push(finalDepositParams, finalWithdrawalParams);
  });
  if (chain == "ehereum") {
    const finalDepositParams = {
      ...depositParams,
      target: ampl,
      fixedEventData: {
        token: ampl,
        to: amplVault,
      },
      filter: {
        includeTxData: [{ to: amplVault }],
      },
    };
    const finalWithdrawalParams = {
      ...withdrawalParams,
      target: ampl,
      fixedEventData: {
        token: ampl,
        from: amplVault,
      },
      filter: {
        includeTxData: [{ to: amplVault }],
      },
    };
    eventParams.push(finalDepositParams, finalWithdrawalParams);
  }
  const underlyingDepositParams = constructTransferParams(gateway, true);
  const underlyingWithdrawalParams = constructTransferParams(gateway, false);
  eventParams.push(underlyingDepositParams, underlyingWithdrawalParams);

  return async (fromBlock: number, toBlock: number) => {
    const eventData = await getTxDataFromEVMEventLogs("axelar", chain as Chain, fromBlock, toBlock, eventParams);
    const uniqueHashesEventData = makeTxHashesUnique(eventData)
    return uniqueHashesEventData
  }
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  bsc: constructParams("bsc"),
  moonriver: constructParams("moonriver"),
  meter: constructParams("meter"),
  theta: constructParams("theta")
};

export default adapter;
