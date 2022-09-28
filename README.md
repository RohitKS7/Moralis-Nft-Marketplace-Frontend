# Project Overview

## 1. Home Page:
- If you own the NFT, you can update the listing.
- If you not own the NFT, than you can buy the listed NFT.

## 2. Sell Page:
- Anyone can list their NFT's
- WithDraw Proceeds

# Setup

1. Install Dependencies.

2. Install `nextjs link tag` to make links in navbar.

3. Creating a Dapp Server on moralis servers in order to do awesome stuffs like -  'listening to events in real time' etc.

4. Add all the important details of server, for instance: "apikey", "AppId" etc. in `.env` file.

  - Nextjs comes with build-in support for "environmental variables" (.env) which allows you to do the awesome stuffs. See Nextjs Docs for more info.

  > In order for our frontend to read environmental variables from .env,
    We need to pass prefix `NEXT_PUBLIC_`.

# 5. How do we tell Moralis Server to listen to our events?
   
   ## i) Connect it to our blockchain:

   ### [Method - 1] Tutorial to connect with hardhat localhost blockchain via "frp":

   - Go to "Devchain Proxy Server" on moralis admin server webpage.

   - Download the "frp" bundle which supports your machine. for me its `frp_0.44.0_linux_amd64.tar.gz` 

   - Extract the archive then copy the `frpc` & `frpc.ini` files and then paste both in frontend directory in a new folder named `frp`

   - Then go to frp folder in terminal and run this cmd `./frpc -c frpc.ini` for linux

   - If you are successfully connected, you will see this `start proxy success`

   ###  [Method - 2] Tutorial to connect with hardhat localhost blockchain via "Moralis Admin CLI"

   - To use the Moralis Admin CLI, you need to install it by running the following code in terminal (terminal location frp folder):

            yarn global add moralis-admin-cli
       
   - Then Run this cmd `moralis-admin-cli` to see the available commands. 

   - We will use `connect-local-devchain` to connect with hardhat localchain. In order for Moralis server to listen the events.

   - Create a script in package.json for it:
         
       "moralis:sync": "moralis-admin-cli connect-local-devchain --chain hardhat --moralisSubdomain {your subdomain} --frpcPath ./frp/frpc"

   - Add `cli key` & `cli secret key` in .env file.

   - Then run your script and enojoy the development process.
      

  ## ii) Which contract, which events, and what to do when it hears to the events.

   - We can sync our contract with the Moralis Server. So, it can listen events in 2 following ways:

     a) Via Moralis Frontend
     b) Programatically (We are doing like this [ Becoz we're developers :) ])

  "CONGRATS YOU'VE SUCCESSFULLY SYNCED YOUR CONTRACT WITH MORALIS DATABASE IN ORDER TO LISTEN TO EVENTS"

> Now once the event is available in database we can query it but there's a caught!
  When someone buy an listed NFT technically that NFT is no more available in the Frontend Marketplace but it's still available in the database. So, we have to "Delete" that event from the database. 

> To solve this problem we're gonna have to use "Cloud Functions"

# 6. How to setup Moralis Cloud Function:
  
  ## Step - 1 : Adding the Listed NFT in new Table, When someone List it.

    i) Create a folder named `cloud functions`
   ii) Create a script to fasciliates cmd run.
  iii) Create a new table called "ActiveItem" in updateActiveItems.js file.
   iv) This will Add Items when they are listed on the marketplace 
   vi) Write your code for cloud function.
  vii) Run the cmd for cloud function and Your ActiveItem is now updated

  ## Step - 2 : Removing the Listed NFT from ActivItm, when someone Bought it.

    - See "ItemCanceled()" in updateActiveItem.js file. That how we remove it.
   
  KBOOM!!! You are good to go now.

    
# TroubleShoot Tips

1. Resetting LocalChain for moralis:
   If you're connected to moralis server and for any reason killed the localchain node so, when you run hardhat node again it might be not connected. In this case click `Reset Local Devchain` in moralis network section.

2. (only for Hardhat) If Price of NFT is not updating in Frontend and in database, then create a script named `mine.js` which will move some blocks So, confirmed can return "true" and frontend will update.
