// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.
const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_eggottvTJ9QkM4WOxzsylAln');
var cors = require('cors');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.get("/setup", async (req, res) => {
  console.log('setup route');
  try {
    res.send({
      publishableKey: "pk_test_7444YYZNspAxth2wFFLly2PH",
      basicPrice: "price_1IuaN8GeWwMQD9UuVR5dCs8x",
    });    
  } catch (error) {
    res.send(error)
  }
});

app.post('/update-checkout-session', async(req, res) => {
  const { customer } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: customer,
      setup_intent_data: {
        metadata: {
          customer_id: 'cus_FOsk5sbh3ZQpAU',
          subscription_id: 'sub_8epEF0PuRhmltU',
        },
      },
      success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/cancel',
    });
    res.send({ sessionId: session.id, });
  } catch (error) {
    res.status(400);
    console.error(e)
    return res.send({
      error: {
        message: e.message,
      }
    });    
  }
})

app.post('/create-checkout-session', async (req, res) => {
  const { priceId, customer } = req.body;
  console.log('checkout session')
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          // For metered billing, do not pass quantity
          quantity: 1,
        },
      ],
      // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
      // the actual Session ID is returned in the query parameter when your customer
      // is redirected to the success page.
      success_url: 'http://localhost:4242/order/sucess/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/canceled.html',
    });
    res.send({ sessionId: session.id });
  } catch (e) {
    res.status(400);
    console.error(e)
    return res.send({
      error: {
        message: e.message,
      }
    });
  }
});

app.post('/list-user-card', async(req, res) => {
  const subscription = await stripe.subscriptions.retrieve('sub_49ty4767H20z6a');
})

app.post('/order/success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const customer = await stripe.customers.retrieve(session.customer);
  res.send(`<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`);
});

app.listen(4242, () => console.log(`Node server listening at http://localhost:${4242}/`));