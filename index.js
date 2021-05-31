// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.
const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_eggottvTJ9QkM4WOxzsylAln')

app.get("/setup", (req, res) => {
  console.log('setup route')
  res.send({
    publishableKey: 'pk_test_7444YYZNspAxth2wFFLly2PH',
    basicPrice: 'price_G0FvDp6vZvdwRZ',
  });
});

app.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;

  // See https://stripe.com/docs/api/checkout/sessions/create
  // for additional parameters to pass.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
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

    app.post('/order/success', async (req, res) => {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        const customer = await stripe.customers.retrieve(session.customer);
   
        res.send(`<html><body><h1>Thanks for your order, ${customer.name}!</h1></body></html>`);
    });
    
    res.send({
      sessionId: session.id,
    });
  } catch (e) {
    res.status(400);
    return res.send({
      error: {
        message: e.message,
      }
    });
  }
});

app.listen(4242, () => console.log(`Node server listening at http://localhost:${4242}/`));