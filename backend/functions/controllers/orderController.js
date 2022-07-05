const { ethers } = require("ethers");

const { Moralis, MoralisOptions } = require("../moralis")
const { getMetadata, convertDecimalToHexadecimal } = require("../utils")
const { db } = require("../firebase")
const { sgMail, msg } = require("../sendgrid")
const { composeOrderConfirm } = require("../utils/emailComposer")
const { CLIENT_BASE } = require("../constants")

exports.getOrders = async (req, res, next) => {
  console.log("get all orders...")
  try {
    const chainQuery = req.query.chain
    const limit = req.query.limit
    const offset = req.query.offset

    let allOrders
    let totalCount
    // console.log(queries)
    if (chainQuery) {
      // console.log(chainQuery)
      const chains = chainQuery.split(',')
      // console.log(chains)
      // converting strings to number
      chains.map((chain, index) => {
        chains[index] = +chain
      })
      // console.log(chains)
      allOrders = await db.collection("orders").where("chainId", "in", chains).where('version', '==', 1).where('visible', '==', true).orderBy('timestamp', 'desc').limit(+limit || 500).offset(+offset || 0).get();

      const totalOrders = await db.collection("orders").where("chainId", "in", chains).where('version', '==', 1).where('visible', '==', true).get()
      totalCount = totalOrders.size
      // console.log(totalCollections.size)

    } else {
      allOrders = await db.collection("orders").where('version', '==', 1).where('visible', '==', true).orderBy('timestamp', 'desc').limit(+limit || 500).offset(+offset || 0).get();
      const totalOrders = await db.collection("orders").where('version', '==', 1).where('visible', '==', true).get()
      totalCount = totalOrders.size
    }
    const result = allOrders.docs.map((doc, index) => ({
      ...doc.data(),
      queryIndex: (+offset || 0) + index + 1
    }))
    // console.log(result)
    res.status(200).json({ status: "ok", orders: result, totalCount })
  } catch (error) {
    next(error)
  }
}

exports.getOrder = async (req, res, next) => {
  try {
    if (!req || !req.params) {
      return res.status(400).json({ message: "missing query params" })
    }
    const { id } = req.params
    console.log("getting order with ID: ", id)
    const order = await db.collection('orders').where('orderId', '==', Number(id)).where('version', '==', 1).get()
    if (order.empty) {
      return res.status(400).json({ message: "order with this ID does not exist" })
    }
    let result = []
    order.forEach(doc => {
      result.push(doc.data())
    });

    res.status(200).json({ status: "ok", order: result[0] })
  } catch (error) {
    next(error)
  }
}

exports.createOrder = async (req, res, next) => {
  console.log("Creating a new order")
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: " req.body missing " })
    }
    console.log(req.body)

    //getting all orders
    const allOrders = await db.collection("orders").get();
    const result = allOrders.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    //assigning orderId
    const orderId = result.reduce((result, item) => {
      if (Number(item.orderId) > result) {
        result = Number(item.orderId)
      }
      return result
    }, 0) + 1
    console.log("Creating order with ID:", orderId)

    const orderItem = {
      ...req.body,
      "version": 1,
      "orderId": orderId,
      "confirmed": false,
      "visible": false,
      "canceled": false,
      "locked": false,
      "timestamp": Math.floor(new Date().valueOf() / 1000)
    }

    // console.log(orderItem)

    await db.collection('orders').add(orderItem)

    res.status(200).json({ status: "ok", body: req.body, orderId })
  } catch (error) {
    next(error)
  }
}

exports.confirmOrder = async (req, res, next) => {
  console.log("Confirming an order")
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: " req.body missing " })
    }
    console.log(req.body)
    const { orderId, message, signature } = req.body
    if (!orderId || !message || !signature) {
      return res.status(400).json({ message: "some or all required fields are missing" })
    }
    const order = await db.collection('orders').where('orderId', '==', Number(orderId)).where('version', '==', 1).get()
    if (order.empty) {
      return res.status(400).json({ message: "order with this ID does not exist" })
    }
    let Item = {}
    let DocID = ""
    order.forEach(doc => {
      Item = doc.data()
      DocID = doc.id
    });
    console.log({ Item })
    const ownerAddress = Item.ownerAddress
    const recoveredAddress = ethers.utils.verifyMessage(message, signature)
    console.log("Verifying order's owner address :  ", ownerAddress)
    console.log("Recovered address : ", recoveredAddress)

    if (recoveredAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      return res.status(400).json({ message: "You are not authorized to confirm the order" })
    }
    console.log("Saving: \n", Item)
    await db.collection("orders").doc(DocID).set({ confirmed: true, visible: true }, { merge: true })

    //SEND EMAIL UPON ORDER CONFIRMATION
    let account = await db.collection("accounts").where("address", "==", ownerAddress).get()

    if (!account.empty) {
      account = account.docs.map((doc) => ({
        ...doc.data(),
      }))[0]
      if (
        account.email === "pongzthor@gmail.com" // TODO: Important! this needs to be changed!
      ) {
        msg.to = account.email
        msg.subject = "Your Order was created and signed successfully"
        let nickname
        if (account.nickname === "Unknown" || !account.nickname) {
          nickname = account.email.split('@')[0]
        } else {
          nickname = account.nickname
        }
        console.log(Item.baseAssetAddress)
        console.log(convertDecimalToHexadecimal(Item.chainId))
        console.log(Item.baseAssetTokenId)
        let nft = await db.collection("nfts").where("address", "==", Item.baseAssetAddress).where("chain", "==", convertDecimalToHexadecimal(Item.chainId)).where("id", "==", Item.baseAssetTokenId).get()
        if (nft.empty) {
          // console.log("fetching metadata from Moralis...")
          await Moralis.start({ ...MoralisOptions })

          const options = {
            address: Item.baseAssetAddress,
            token_id: Item.baseAssetTokenId,
            chain: convertDecimalToHexadecimal(Item.chainId),
          };
          let tokenIdMetadata
          try {
            tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
            console.log({ tokenIdMetadata })

            const result = await getMetadata(tokenIdMetadata)
            const metadata = result.metadata
            // console.log("saving nft to firestore database...")
            await db.collection('nfts').add({ address: Item.baseAssetAddress, id: Item.baseAssetTokenId, chain: convertDecimalToHexadecimal(Item.chainId), metadata })
            nft.metadata = metadata
          } catch (error) {

          }

        } else {
          nft = nft.docs.map((doc) => ({ ...doc.data() }))[0]
          console.log(nft)
        }

        msg.html = await composeOrderConfirm(nickname || account.email, orderId, nft.metadata.image, CLIENT_BASE + orderId)
        console.log(msg)
        await sgMail.send(msg)
      }
    }
    res.status(200).json({ status: "ok", orderId })
  } catch (error) {
    next(error)
  }
}

exports.cancelOrder = async (req, res, next) => {
  console.log("Cancelling an order")
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: " req.body missing " })
    }
    console.log(req.body)
    const { orderId, message, signature } = req.body
    if (!orderId || !message || !signature) {
      return res.status(400).json({ message: "some or all required fields are missing" })
    }
    const order = await db.collection('orders').where('orderId', '==', Number(orderId)).where('version', '==', 1).get()
    if (order.empty) {
      return res.status(400).json({ message: "order with this ID does not exist" })
    }
    let Item = {}
    let DocID = ""
    order.forEach(doc => {
      Item = doc.data()
      DocID = doc.id
    });
    console.log({ Item })
    const ownerAddress = Item.ownerAddress
    const recoveredAddress = ethers.utils.verifyMessage(message, signature)
    console.log("Verifying order's owner address :  ", ownerAddress)
    console.log("Recovered address : ", recoveredAddress)

    if (recoveredAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      return res.status(400).json({ message: "You are not authorized to cancel the order" })
    }
    console.log("Saving: \n", Item)
    await db.collection("orders").doc(DocID).set({ cancelled: true }, { merge: true })

    //SEND EMAIL UPON ORDER CANCELLATION
    let account = await db.collection("accounts").where("address", "==", ownerAddress).get()

    if (!account.empty) {
      account = account.docs.map((doc) => ({
        ...doc.data(),
      }))[0]
      if (
        account.email === "pongzthor@gmail.com" // TODO: Important! this needs to be changed!
      ) {
        msg.to = account.email
        msg.subject = "Your Order was cancelled"
        msg.html = `<p>Your Order with Id: ${orderId} was cancelled </p><br><strong>Tamago Team</strong>`
        await sgMail.send(msg)
      }
    }


    res.status(200).json({ status: "ok", orderId })
  } catch (error) {
    next(error)
  }
}

exports.getOrdersByCollection = async (req, res, next) => {
  console.log("getting orders by collection...")
  try {
    if (!req || !req.params) {
      return res.status(400).json({ message: "missing query params" })
    }
    const { address } = req.params
    const orders = await db.collection("orders")
      .where('version', '==', 1)
      .where('visible', '==', true)
      .where('baseAssetAddress', '==', address.toLowerCase())
      .get()

    let result = orders.docs.map((doc) => ({
      ...doc.data(),
    }))


    if (!result.length) {
      return res.status(400).json({ message: "orders with this collection address does not exist" })
    }


    res.status(200).json({ status: "ok", orders: result })


  } catch (error) {
    next(error)
  }
}

exports.getOrdersByOwner = async (req, res, next) => {
  console.log("getting orders by owner...")
  try {
    if (!req || !req.params) {
      return res.status(400).json({ message: "missing query params" })
    }
    // console.log(req.params)
    const { owner } = req.params
    const orders = await db.collection("orders")
      .where('version', '==', 1)
      .where('visible', '==', true)
      .where("ownerAddress", "==", owner)
      .orderBy('timestamp', 'desc')
      .get()

    if (orders.empty) {
      return res.status(400).json({ message: "orders with this creator address does not exist" })
    }
    const result = orders.docs.map((doc) => ({
      ...doc.data(),
    }))
    console.log(result)
    res.status(200).json({ status: "ok", orders: result })

  } catch (error) {
    next(error)
  }
}

