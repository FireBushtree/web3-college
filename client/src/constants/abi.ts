export const AAVE_POOL_ABI = [
  {
    type: 'function',
    name: 'supply',
    inputs: [
      {
        name: 'asset',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'onBehalfOf',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'referralCode',
        type: 'uint16',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
]
