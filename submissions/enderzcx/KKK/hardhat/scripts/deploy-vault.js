const { ethers } = require('hardhat');

const IMPLEMENTATION = '0xB5AAFCC6DD4DFc2B80fb8BCcf406E1a2Fd559e23';
const ALLOWED_TOKEN = '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';

async function main() {
  const [deployer] = await ethers.getSigners();

  const Proxy = await ethers.getContractFactory('ERC1967Proxy');

  const iface = new ethers.Interface([
    'function initialize(address allowedToken, address owner)'
  ]);

  const data = iface.encodeFunctionData('initialize', [ALLOWED_TOKEN, deployer.address]);

  const proxy = await Proxy.deploy(IMPLEMENTATION, data);
  await proxy.waitForDeployment();

  console.log('Vault Proxy:', await proxy.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
