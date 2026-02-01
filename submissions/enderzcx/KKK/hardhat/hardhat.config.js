require('dotenv').config();
require('@nomicfoundation/hardhat-ethers');

const { RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: '0.8.24',
  networks: {
    kite: {
      url: RPC_URL || '',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
