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


## Minting process

Minting an NFT means to convert a digital asset into a non-fungible token which has a unique ID on the blockchain. A digital asset is any file that is created electronically. It can be an image, an article, a video, etc. The conversion to an NFT is called minting.
Minting occurs via Smart Contracts and in most cases the [ERC-721 Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/) is used.
The standard defines the interface of an NFT, so the functions which have to be present, for the contract to be accepted as part of the ERC-721 standard.
[Openzeppelin](https://www.openzeppelin.com/) is the industry standard for the implementation of the ERC standards.

### The following section describes what happens inside such a smart contract during the mint process:

First the function checks whether you are trying to mint to the zero address, which is called *burn address*.
Afterwards, it is checked whether the requested `tokenId` for the new NFT already exists.
As it was mentioned NFTs have a unique ID, therefore this is necessary.
Then a callback is invoked which can be overwritten by a user to perform certain actions before an NFT is minted.
The next two lines are those where the magic happens.
The two variables are `_balances` and `_owners` and both mappings.
A mapping is table, which contains keys and values and the keys have to be unique.
The `_balances` mapping maps from an `address` to a number, and contains the amount of tokens a user owns.
This amount can be queried by the `balanceOf(address)` contract call.
The second variable `_owners` maps from a `tokenId` to an `address`, and contains the information of which `tokenId` is owned by which `address`.
In the end also a transfer event is emitted and again a post minting callback is executed.

```solidity
// @openzeppelin/contracts/token/ERC721/ERC721.sol:L279
function _mint(address to, uint256 tokenId) internal virtual {
  require(to != address(0), "ERC721: mint to the zero address");
  require(!_exists(tokenId), "ERC721: token already minted");

  _beforeTokenTransfer(address(0), to, tokenId);

  _balances[to] += 1;
  _owners[tokenId] = to;

  emit Transfer(address(0), to, tokenId);

  _afterTokenTransfer(address(0), to, tokenId);
}
 ```

## Mint, Deposit, Withdrawal

On Immutable assets can be minted on L2 and then be withdrawn to L1, which would be the default and preferred behavior.
Another option would be to mint the asset on L1 and deposit it to L2.

### Minting Layer 1
Minting on L1 requires an interaction with the L1 smart contract, and the functions as described above are used.
L1 minted assets can then be deposited to L2 by interacting with the Immutable bridge contract. A user-friendly implementation of the bridge can be found [here](https://imxwallet.tools/).
If assets are minted on L1 they can not be actively minted on L2, only during a deposit.

### Minting Immutable Layer 2
For an Immutable X minted asset to be minted on L2 it has to implement a `mintFor` function as it is shown in the [Immutable X example contract](https://github.com/immutable/imx-contracts/blob/main/contracts/Asset.sol#L15) in the L1 contract.
This is required, so that the asset can be withdrawn to L1.
Minting itself can be performed with the official [imx-sdk](https://www.npmjs.com/package/@imtbl/imx-sdk), or the unofficial [imxpy](https://github.com/dimfred/imxpy) project.
It requires the minting call to be signed by the L1 contract owner, and some additional data such as the royalties, which apply to the minted token.
In general during an L2 mint call there is no real interaction with the L1 smart contract, only with its representation on L2.


## Cost of Minting

### Minting fees Layer 1

Minting an NFT on L1 requires a gas fee, which is paid to the miners, who secure the network and validate the transactions.
L1 gas fees fluctuate on a daily basis and correlate with the traffic on the Ethereum network.
Especially during hot NFT drops, the gas fees can spike rapidly, resulting in a so called **gas-war**, which is the main cause of high transaction fees.
Is gas-war is like an auction who gets validated first and people pay more gas so they can get their transactions processed quicker, ‌driving the transaction costs up.
They're prevalent on the Ethereum network, ‌infamous for its performance and scalability setbacks.

### Minting fees Immutable Layer 2

In comparison, minting on Immutable L2  is (nearly) completely gas free and offers a carbon friendly solution in comparison to the mining process on L1.
From a user perspective you only pay a negligible amount of ETH dust when minting, which is needed to issue the transaction.
From a project owner perspective Immutable will take a 2% cut of all primary minting sales.

## Minting requirements

So, you want to mint your first NFT? Make sure your setup meets the requirements to mint on L1 or L2.

### Requirements Layer 1

- A crypto wallet capable of managing ERC-20 and ERC-721 tokens: The most common and widely adopted solution is [Metamask](https://metamask.io/). Metamask can be installed as a browser addon and is setup in a few easy steps as described [here](https://metamask.zendesk.com/hc/en-us/articles/360015489531-Getting-Started-With-MetaMask).
- A positive L1 ETH balance: In order to mint an NFT on L1 your account needs to possess enough ETH to pay for the NFT you are about to mint plus an additional gas fee, which is paid to the miners. You can find rough updated estimates on minting transaction costs [here](https://www.gwei.at/).

### Requirements Immutable Layer 2

- Immutable X Key: Your crypto wallet must be setup with Immutable in order to authorize transactions and confirm your identity. The Immutable X Key will act as an extension to your Ethereum wallet. A step-by-step guide with visual information is available [here](https://support.immutable.com/hc/en-us/articles/360062010454-Creating-a-new-Immutable-X-Key).
- A positive L2 ETH balance: In order to mint an NFT on L2 your account needs to posess enough ETH to pay for the NFT you are about to mint plus a negligible amount of ETH dust, in order to trigger a transaction. You can transfer your L1 ETH to L2 by following [this guide](https://support.immutable.com/hc/en-us/articles/360062011474-Depositing-ETH-to-Immutable-X).


After these steps are completed, you are ready to mint your NFT on L1 or Immutable L2!
