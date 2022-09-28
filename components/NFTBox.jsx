import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftAbi from "../constants/BasicNft.json"
import marketplaceAbi from "../constants/NftMarketplace.json"
import Image from "next/image"
import { Card, useNotification } from "@web3uikit/core"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

// function for shortning the address
const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBox({ price, nftAddress, tokenId, seller, marketplaceAddress }) {
    const dispatch = useNotification()

    // account = will grab the person's metamask account
    const { isWeb3Enabled, account } = useMoralis()
    // Hook for getting Image URI from TOKEN URL
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDesc, setTokenDesc] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)

    const { error, runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: marketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    async function updateUI() {
        // get the tokenURI
        const tokenURI = await getTokenURI()
        console.log(`error is ${error}`)
        console.log(`The tokenURI is ${tokenURI}`)

        // using the Image tag from the tokenURI, to get the images
        // QUESTION \\ NOT EVERYONE HAVE IPFS CAMPANION IN THEIR BROWSER, SO how we're gonna show the image.
        // ANSWER \\ We're using "IPFS Gateway": "A server that will convert the IPFS files and return it in normal URL (https consist) form. "
        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            // NOTE await to fetch the response then await to convert in json
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = await tokenURIResponse.image
            const imageURIURL = await imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDesc(tokenURIResponse.description)

            // QUESTION \\ Do we have other simple ways to do above code?
            // ANSWER \\ YES!
            // 1. Since we're using moralis We can render the image on our server, and just call our server.
            // 2. For Testnets and Mainnets, Moralis comes with some hooks like- "useNFTBalances()" which will show us all the information of NFT.
            //
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined
    // if it's owned by you and if not condition
    const formattedSellerAddress = isOwnedByUser ? "You" : truncateStr(seller || "", 15)

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => {
                      console.log(error)
                  },
                  onSuccess: () => handleBuyItemSuccess(),
              })
    }

    const handleBuyItemSuccess = async (/* tx*/) => {
        // await tx.wait(1)
        dispatch({
            type: "success",
            message: "Item Bought!",
            title: "Item Bought Successfully!",
            position: "topL",
        })
    }

    return (
        <div>
            {imageURI ? (
                <div>
                    <UpdateListingModal
                        isVisible={showModal}
                        tokenId={tokenId}
                        marketplaceAddress={marketplaceAddress}
                        nftAddress={nftAddress}
                        onClose={hideModal}
                    />
                    <Card title={tokenName} description={tokenDesc} onClick={handleCardClick}>
                        <div className="p-2">
                            <div className="flex flex-col items-end gap-2">
                                <div>#{tokenId}</div>
                                <div className="mb-4 italic text-sm">
                                    Owned By: {formattedSellerAddress}{" "}
                                </div>
                                <Image
                                    loader={() => imageURI}
                                    src={imageURI}
                                    alt="nft image"
                                    height="200"
                                    width="200"
                                />
                                <div className="font-bold">
                                    Price: {ethers.utils.formatUnits(price, "ether")} ETH
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}
