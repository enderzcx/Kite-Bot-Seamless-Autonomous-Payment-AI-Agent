const { ethers } = require('hardhat');

async function main() {
  const vault = process.env.VAULT_PROXY;
  if (!vault) throw new Error('Missing VAULT_PROXY in env');

  const iface = new ethers.Interface([
    'function setSpendingRules((uint256 timeWindow,uint160 budget,uint96 initialWindowStartTime,bytes32[] targetProviders)[] rules)'
  ]);

  const nowTs = Math.floor(Date.now() / 1000);
  const rules = [
    // 单笔上限：5 KITE (6 位小数)
    [0, BigInt(5_000_000), 0, []],
    // 日上限：50 KITE
    [86400, BigInt(50_000_000), nowTs, []]
  ];

  const data = iface.encodeFunctionData('setSpendingRules', [rules]);

  const [signer] = await ethers.getSigners();
  const tx = await signer.sendTransaction({
    to: vault,
    data
  });

  console.log('Set rules tx:', tx.hash);
  await tx.wait();
  console.log('Done');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
