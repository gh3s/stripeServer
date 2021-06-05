var handleFetchResult = function (result) {
   if (!result.ok) {
    return result.json().then(function(json) {
      if (json.error && json.error.message) {
        throw new Error(result.url + ' ' + result.status + ' ' + json.error.message);
      }
    }).catch(function(err) {
      showErrorMessage(err);
      throw err;
    });
  }
  return result.json();
};

// Create a Checkout Session with the selected plan ID
var createCheckoutSession = function (customer) {
  return fetch("http://localhost:4242/create-checkout-session", {
    method: "post",
    headers: {
      'Accept': 'application/json, text/plain, */*',
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "priceId": "price_1IuaN8GeWwMQD9UuVR5dCs8x",
      "customer": 'cus_Jbp7vt3d8C7F9M',
    })
  })
  .then(handleFetchResult)
  .catch(e=>console.error(e))
  ;
};

var createUpdateSession = function (priceId, qty) {
  return fetch("http://localhost:4242/update-checkout-session", {
    method: "post",
    headers: {
      'Accept': 'application/json, text/plain, */*',
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "priceId": "price_1IuaN8GeWwMQD9UuVR5dCs8x",
      "customer": "cus_Jbp7vt3d8C7F9M",
      "quantity": 1,
      "subscription": null
    })
  })
  .then(handleFetchResult)
  .catch(e=>console.error(e))
  ;
};

// Handle any errors returned from Checkout
var handleResult = function (result) {
  if (result.error) {
    showErrorMessage(result.error.message);
  }
};

var showErrorMessage = function (message) {
  var errorEl = document.getElementById("error-message")
  errorEl.textContent = message;
  errorEl.style.display = "block";
};

/* Get your Stripe publishable key to initialize Stripe.js */
fetch("http://localhost:4242/setup")
  .then(handleFetchResult)
  .then(function (json) {
    console.log(json)
    var publishableKey = json.publishableKey;
    var basicPriceId = json.basicPrice;
    var stripe = Stripe(publishableKey);
    
    document
    .getElementById("basic-plan-btn")
    .addEventListener("click", function (evt) {
      createCheckoutSession()
      .then(function (data) {
        stripe
          .redirectToCheckout({ sessionId: data.sessionId })
          .then(handleResult);
      });
    });

    document
    .getElementById("pro-plan-btn")
    .addEventListener("click", function (evt) {
      createUpdateSession(basicPriceId)
      .then(function (data) {
        stripe
        .redirectToCheckout({ sessionId: data.sessionId })
        .then(handleResult);
      });
    });

  }); 