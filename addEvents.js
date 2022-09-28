// ANSWER \\ When you run the `node addEvents.js` it will be success but when you run it again it might give you "something went wrong" becoz in database this events already exists

const Moralis = require("moralis-v1/node")
require("dotenv").config()
const contractAddresses = require("./constants/networkMapping.json")
let chainId = process.env.chainId || 31337
// NOTE Moralis understands a local chain is 1337. So, we have to convert it.
let moralisChainId = chainId == "31337" ? "1337" : chainId

const contractAddress = contractAddresses[chainId]["NftMarketplace"][0]

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
const appId = process.env.NEXT_PUBLIC_APP_ID
const masterKey = process.env.masterKey

async function main() {
    await Moralis.start({ serverUrl, appId, masterKey })
    console.log(`working with contract ${contractAddress}`)

    let itemListedOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        // topic = event name and parameters
        topic: "ItemListed(address, address, uint256, uint256)",
        // abi of just the event
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemListed",
            type: "event",
        },
        // tableName = a new table with data in moralis database dashboard
        tableName: "ItemListed",
    }

    let itemBoughtOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        topic: "ItemBought(address, address, uint256, uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "buyer",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemBought",
            type: "event",
        },
        tableName: "ItemBought",
    }

    let itemCanceledOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        topic: "ItemCanceled(address, address, uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            name: "ItemCanceled",
            type: "event",
        },
        tableName: "ItemCanceled",
    }

    const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
        useMasterKey: true,
    })
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
        useMasterKey: true,
    })
    const canceledResponse = await Moralis.Cloud.run("watchContractEvent", itemCanceledOptions, {
        useMasterKey: true,
    })
    if (listedResponse.success && boughtResponse.success && canceledResponse.success) {
        console.log("success! Database updated with watching events")
    } else {
        console.log("something went wrong!")
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
