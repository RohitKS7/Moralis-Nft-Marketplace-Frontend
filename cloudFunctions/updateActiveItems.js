// Anytime something is listed on "ItemListed" table run some async function(your code)
Moralis.Cloud.afterSave("ItemListed", async (request) => {
    // Every event gets triggered twice, once on unconfirmed, again on confirmed
    // NOTE \\ and we only want it to save once our transaction is confirmed
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`MarketPlace | Object ${request.object}`)
    // ANSWER \\ after we run the above code our event confirmed is still "false"!! In order to make it "true" we have to mine a block ahead of "event transaction"
    // REVIEW \\ We are adding a new utils file called "move-blocks.js" in "nft-marketplace-contract" folder. Which will mine a block ahead of "event Tx"

    if (confirmed) {
        logger.info("found Item!")
        // If ActiveItem table exits then Grab it! & if Not then create it.
        const ActiveItem = Moralis.Object.extend("ActiveItem")

        // TODO check if any item already exists or not. If exists then we have to run updateListing() and delete it first then reupload with new price
        const query = new Moralis.Query("ActiveItem")
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        query.equalTo("seller", request.object.get("seller"))
        logger.info(`MarketPlace | Query ${query}`)
        const alreadyListedItem = await query.first()
        if (alreadyListedItem) {
            logger.info(`Deleting already listed ${request.object.get("objectId")}`)
            await alreadyListedItem.destroy()
            logger.info(
                `Deleted item with TokenId: ${request.object.get(
                    "tokenId"
                )} at address: ${request.object.get("address")} since it's already been listed!`
            )
        }

        // Creating a new entry in this ActiveItem table
        const activeItem = new ActiveItem()
        // marketplaceAddress is a new column in the table
        activeItem.set("marketplaceAddress", request.object.get("address")) // requesting for the contract address from which this event came from.

        // Now getting all the params from event to add it in ActiveItem table
        activeItem.set("nftAddress", request.object.get("nftAddress"))
        activeItem.set("price", request.object.get("price"))
        activeItem.set("tokenId", request.object.get("tokenId"))
        activeItem.set("seller", request.object.get("seller"))

        logger.info(
            `Adding Address: ${request.object.get("address")}. TokenId: ${request.object.get(
                "tokenId"
            )}`
        )
        logger.info("SAving ItemListed Row...")
        await activeItem.save()
    }
})

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`MarketPlace | Object ${request.object}`)

    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)

        // Querying if ActiveItem already consists this columnItems or not
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        // We don't need to look for the seller
        logger.info(`Marketplace | Query: ${query}`)

        // We're looking first activeItem in our database that has the same "marketplaceAddress", "nftAddress" & "tokenId" that just got canceled
        const canceledItem = await query.first()
        logger.info(`Marketplace | CanceledItem: ${canceledItem}`)

        if (canceledItem) {
            logger.info(
                `Deleting tokenId: ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")} since it was canceled`
            )
            await canceledItem.destroy() // With destroy(), we're are removing that Listed NFT data from ActiveItem
        } else {
            logger.info(
                `NO item found with address ${request.object.get(
                    "address"
                )} and tokenId: ${request.object.get("tokenId")}`
            )
        }
    }
})

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`MarketPlace | Object ${request.object}`)

    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info(`Marketplace | Query: ${query}`)
        const boughtItem = await query.first()

        if (boughtItem) {
            logger.info(`Deleting : ${request.object.get("objectId")}`)
            await boughtItem.destroy()
            logger.info(
                `Deleted item with TokenId: ${request.object.get(
                    "tokenId"
                )} at address: ${request.object.get("address")}`
            )
        } else {
            logger.info(
                `NO item found with address ${request.object.get(
                    "address"
                )} and tokenId: ${request.object.get("tokenId")}`
            )
        }
    }
})
