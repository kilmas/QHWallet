const crossFoAbi = [
  {
    constant: true,
    inputs: [],
    name: 'owner',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'changeOwner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '',
        type: 'address',
      },
      {
        indexed: true,
        name: '',
        type: 'uint64',
      },
    ],
    name: 'eventRegister',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'name',
        type: 'uint64',
      },
    ],
    name: 'fibosTransName',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'name',
        type: 'uint64',
      },
      {
        indexed: true,
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'fibosBPSName',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'id',
        type: 'bytes32',
      },
      {
        indexed: true,
        name: 'erc20Address',
        type: 'address',
      },
    ],
    name: 'logTxid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'eventEthTransfer',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'foxAddress',
        type: 'address',
      },
    ],
    name: 'setFoxAdderss',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'foxAddress',
        type: 'address',
      },
      {
        name: 'sigVs',
        type: 'uint8[]',
      },
      {
        name: 'sigRs',
        type: 'bytes32[]',
      },
      {
        name: 'sigSs',
        type: 'bytes32[]',
      },
    ],
    name: 'setFoxAddressByBps',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'height',
        type: 'uint64',
      },
      {
        name: 'version',
        type: 'uint64',
      },
      {
        name: 'Up',
        type: 'bytes',
      },
      {
        name: 'Down',
        type: 'bytes',
      },
      {
        name: 'sigVs',
        type: 'uint8[]',
      },
      {
        name: 'sigRs',
        type: 'bytes32[]',
      },
      {
        name: 'sigSs',
        type: 'bytes32[]',
      },
      {
        name: 'name',
        type: 'uint64',
      },
      {
        name: 'index',
        type: 'uint64[]',
      },
    ],
    name: 'bp_update',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'id',
        type: 'bytes32',
      },
      {
        name: 'ref_id',
        type: 'bytes32',
      },
      {
        name: 'version',
        type: 'uint64',
      },
      {
        name: 'data',
        type: 'bytes',
      },
      {
        name: 'sigVs',
        type: 'uint8[]',
      },
      {
        name: 'sigRs',
        type: 'bytes32[]',
      },
      {
        name: 'sigSs',
        type: 'bytes32[]',
      },
      {
        name: 'name',
        type: 'uint64',
      },
    ],
    name: 'add_transaction',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'foxAddress',
        type: 'address',
      },
      {
        name: 'sigVs',
        type: 'uint8[]',
      },
      {
        name: 'sigRs',
        type: 'bytes32[]',
      },
      {
        name: 'sigSs',
        type: 'bytes32[]',
      },
    ],
    name: 'UpgradeVerify',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'getBPList',
    outputs: [
      {
        name: 'bpsAdderss',
        type: 'address[21]',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'erc20Address',
        type: 'address',
      },
    ],
    name: 'getworld_trans_id',
    outputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getworld_bp_version',
    outputs: [
      {
        name: '',
        type: 'uint64',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'account',
        type: 'uint64',
      },
    ],
    name: 'register',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export default crossFoAbi
