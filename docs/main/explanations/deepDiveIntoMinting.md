---
id: "minting-deep-dive"
title: "Deep Dive into Minting"
slug: "/minting-deep-dive"
sidebar_position: 1
keywords: [minting]
---

# Deep Dive into Minting

## What you will learn in this article:

- The meaning of *minting*, which smart contract functions are invoked and how information is stored about the token owners
- Different ways of minting on Layer1 (L1) and Layer2 (L2)
- How tokens minted on L2 are recognized on L1 and vice versa
- Cost comparison of minting on L1 vs. Immutable L2
- Minting requirements for L1 and L2

## What does it mean to 'mint' a token?

Minting is a process used to create new tokens for a blockchain network. Minting requires little resources and is used to increase the circulating supply of a specific token.
Minting can happen with non-fungible-tokens (NFTs), which are unique and cannot be reproduced, or fungible tokens, in most cases tokens for cryptocurrencies where the token's properties do not differ from each other.

### Minting non-fungible-tokens

Minting an NFT means to convert a digital asset into a non-fungible token which has a unique ID on the blockchain.
A digital asset is any file that is created electronically.
It can be an image, an article, a video, etc.
The conversion to an NFT is called minting.
Minting occurs via Smart Contracts and in most cases the [ERC-721 Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/) is used.
The standard defines the interface of an NFT, so the functions which have to be present, for the contract to be accepted as part of the ERC-721 standard.
[Openzeppelin](https://www.openzeppelin.com/) is the industry standard for the implementation of the ERC standards.
During the mint a mapping in the smart contract, which maps from the id of a token to the address of the owner is updated.
Which basically means, if the token with the id 42 is minted by user `0x1337...`, a new entry is created with `tokenMapping[42] = '0x1337...'`.

### Minting fungible-tokens

Cryptocurrencies that are minted are fungible tokens and often have no upper supply limit and rely on the continued growth of the project's economic system to remain valuable. Minting cryptocurrencies is similar to minting fiat money in traditional finance and banking in that there is theoretically no upper limit to the amount of money that can be printed, except that printing must be controlled to prevent excessive inflation/devaluation.

## The following section describes what happens inside such a smart contract during the mint process:

```solidity
// @openzeppelin/contracts/token/ERC721/ERC721.sol:L279
function _mint(address to, uint256 tokenId) internal virtual {
  // 1. Check that the token is not 'burned'
  require(to != address(0), "ERC721: mint to the zero address");
  // 2. Check that the token has no yet been minted
  require(!_exists(tokenId), "ERC721: token already minted");

  // 3. Call which can be overwritten by the user
  _beforeTokenTransfer(address(0), to, tokenId);

  // 4. Update the balance (used by balanceOf(address))
  _balances[to] += 1;
  // 5. Update the token owner (user by ownerOf(tokenId))
  _owners[tokenId] = to;

  // 6. Emit the Transfer event, which can be queried later
  emit Transfer(address(0), to, tokenId);

  // 7. Call which can be overwritten by the user
  _afterTokenTransfer(address(0), to, tokenId);
}
 ```

1. **Check that the token is not 'burned'** - checks whether the user is trying to mint to the zero address aka. the *burn address*
2. **Check that the token has not yet been minted** - only tokens that have not yet been minted, can be minted
3. **Usercallback (beforeTokenTransfer)** - can be overwritten by the user to call a function before a token is transferred
4. **Update the balance map** - increase the balance of the user by 1 (the amount of minted NFTs)
5. **Update the owner map** - set the token to be owner by the minting user
6. **Emit the Transfer event** - events can be looked up in nodes, to verify whether something really occurred on the blockchain. They provide a simple way to communicate to outside services.
7. **Usercallback (afterTokenTransfer)** - can be overwritten by the user to call a function after   a token is transferred

## Mint, Deposit, Withdrawal

On Immutable assets can be minted on L2 and then be withdrawn to L1, which would be the default and preferred behavior, since it is way cheaper than minting on L1.
Another option would be to mint the asset on L1 and deposit it to L2.

### Minting Layer 1

Minting on L1 requires an interaction with the L1 smart contract, and the functions as described above are used.
L1 minted assets can then be deposited to L2 by interacting with the Immutable bridge contract. A user-friendly implementation of the bridge can be found [here](https://imxwallet.tools/).
If assets are minted on L1 they can not be actively minted on L2, only during a deposit.

### Minting Immutable Layer 2

For an Immutable X minted asset to be minted on L2 it has to implement a `mintFor` function as it is shown in the [Immutable X example contract](https://github.com/immutable/imx-contracts/blob/main/contracts/Asset.sol#L15) in the L1 contract.
This is required, so that the asset can be withdrawn to L1.
Minting itself can be performed with the official [imx-sdk](https://www.npmjs.com/package/@imtbl/imx-sdk), or the unofficial [imxpy](https://github.com/dimfred/imxpy) project.
In the following the minting payload is shown, which is required for the RPC call:

```jsonc
{
  // in one call multiple tokens can be minted to multiple users
  "mints": [
    {
      // the destination address of the mint
      "user": "0x...",
      // the tokens which the user should receive
      "tokens": [
        {
          // the type of the token (ERC721 / ERC20)
          "type": "ERC721",
          // the data of the token
          "data": {
            "id": "<asset ID>", // custom asset ID (it's possible to make this the ERC-721 token ID depending on the mintable contract implementation)
            "blueprint": "<on-chain metadata>", // the on-chain metadata of the asset, this can be parsed during withdrawal, hence also stored on L1
            "token_address": "0x...", // the address of the token contract on L1, which is also used as an identifier on L2
            // royalties associated with this tokenId
            "royalties": [
              {
                "recipient": "0x...", // recipient of the royalties
                "percentage": 2.5 // amount of the royalties
              }
            ]
          }
        }
      ],
      "auth_signature": "0x..." // signature signed by the contract owner
    }
  ]
}
```

## Cost of Minting

### Minting fees Layer 1

Minting an NFT on L1 requires a gas fee, which is paid to the miners, who secure the network and validate the transactions.
L1 gas fees fluctuate on a daily basis and correlate with the traffic on the Ethereum network.
Especially during hot NFT drops, the gas fees can spike rapidly, resulting in a so called **gas-war**, which is the main cause of high transaction fees.
Is gas-war is like an auction who gets validated first and people pay more gas, so they can get their transactions processed quicker, ‌driving the transaction costs up.
They're prevalent on the Ethereum network, infamous for its performance and scalability setbacks.

### Minting fees Immutable Layer 2

In comparison, minting on Immutable L2  is (nearly) completely gas free and offers a carbon friendly solution in comparison to the mining process on L1. The reason for these low transaction fees is the [ZK rollup](https://docs.x.immutable.com/docs/architecture-overview/#zk-rollups) mechanism. A ZK rollup allows for multiple off-chain transactions/trades to be bundled up into a single transaction. The total transaction proof is then evaluated by on-chain smart contracts in order to verify each individual transaction.
From a user perspective you only pay a negligible amount of ETH dust when minting, which is needed to issue the transaction.
From a project owner perspective Immutable will take a 2% cut of all primary minting sales.

## Minting requirements

So, you want to mint your first NFT? Make sure your setup meets the requirements to mint on L1 or L2.

### Requirements Layer 1

- A crypto wallet capable of managing ERC-20 and ERC-721 tokens: The most common and widely adopted solution is [Metamask](https://metamask.io/). Metamask can be installed as a browser addon and is set up in a few easy steps as described [here](https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask).
- A positive L1 ETH balance: In order to mint an NFT on L1 your account needs to possess enough ETH to pay for the NFT you are about to mint plus an additional gas fee, which is paid to the miners. You can find rough updated estimates on minting transaction costs [here](https://www.gwei.at/).

### Requirements Immutable Layer 2

- Immutable X Key: Your crypto wallet must be setup with Immutable in order to authorize transactions and confirm your identity. The Immutable X Key will act as an extension to your Ethereum wallet. A step-by-step guide with visual information is available [here](https://support.immutable.com/hc/en-us/articles/360062010454-Creating-a-new-Immutable-X-Key).
- A positive L2 ETH balance: In order to mint an NFT on L2 your account needs to possess enough ETH to pay for the NFT you are about to mint plus a negligible amount of ETH dust, in order to trigger a transaction. You can transfer your L1 ETH to L2 by following [this guide](https://support.immutable.com/hc/en-us/articles/360062011474-Depositing-ETH-to-Immutable-X).


After these steps are completed, you are ready to mint your NFT on L1 or Immutable L2!
