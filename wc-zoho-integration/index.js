require('dotenv').config();

const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const {
  WC_SITE_URL,
  WC_CONSUMER_KEY,
  WC_CONSUMER_SECRET,
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REFRESH_TOKEN,
  ZOHO_ACCOUNTS_DOMAIN,
  ZOHO_API_DOMAIN
} = process.env;


// -----------------------------------------
// 1. Get a fresh Zoho Access Token
// -----------------------------------------

async function getZohoAccessToken() {
  const res = await axios.post(
    `${ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`,
    null,
    {
      params: {
        refresh_token: ZOHO_REFRESH_TOKEN,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    }
  );

  return res.data.access_token;
}


// -----------------------------------------
// 2. Get recent WooCommerce orders
// -----------------------------------------

async function getRecentOrders() {
  const res = await axios.get(
    `${WC_SITE_URL}/wp-json/wc/v3/orders`,
    {
        auth: {
            username: WC_CONSUMER_KEY,
            password: WC_CONSUMER_SECRET
        },
        params: {
            status: 'processing,completed',
            per_page: 20
        },
        httpsAgent
    }

  );

  return res.data;
}


// -----------------------------------------
// 3. Create or find a Zoho Contact
// -----------------------------------------

async function upsertContact(token, order) {

  const email = order.billing.email;

  const headers = {
    Authorization: `Zoho-oauthtoken ${token}`
  };

  // Search for an existing Contact using email
  const search = await axios.get(
    `${ZOHO_API_DOMAIN}/crm/v8/Contacts/search`,
    {
      headers,
      params: {
        email: email
      },
      validateStatus: () => true
    }
  );

  // If Contact already exists
  if (
    search.status === 200 &&
    search.data.data?.length
  ) {
    return search.data.data[0].id;
  }

  // Otherwise create a new Contact
  const create = await axios.post(
    `${ZOHO_API_DOMAIN}/crm/v8/Contacts`,
    {
      data: [
        {
          First_Name: order.billing.first_name,
          Last_Name: order.billing.last_name || 'N/A',
          Email: email
        }
      ]
    },
    {
      headers
    }
  );

  return create.data.data[0].details.id;
}


// -----------------------------------------
//  4. Check if a Deal already exists
// -----------------------------------------

async function dealExists(token, orderId) {

  const headers = {
    Authorization: `Zoho-oauthtoken ${token}`
  };

  const dealName = `Order #${orderId}`;

  const search = await axios.get(
    `${ZOHO_API_DOMAIN}/crm/v8/Deals/search`,
    {
      headers,
      params: {
        word: dealName
      },
      validateStatus: () => true
    }
  );

  if (
    search.status === 200 &&
    search.data.data?.length
  ) {
    return true;
  }

  return false;
}


// -----------------------------------------
// 5. Create a Zoho Deal if it doesn't exist
// -----------------------------------------

async function createDeal(token, order, contactId) {

  const headers = {
    Authorization: `Zoho-oauthtoken ${token}`
  };

  // Check if this order already has a Deal
  const exists = await dealExists(
    token,
    order.id
  );

  if (exists) {
    console.log(
      `↪ Order #${order.id} already has a Deal - skipped`
    );

    return;
  }

  const productNames = order.line_items
    .map(item => item.name)
    .join(', ');

  await axios.post(
    `${ZOHO_API_DOMAIN}/crm/v8/Deals`,
    {
      data: [
        {
          Deal_Name: `Order #${order.id} - ${productNames}`,
          Amount: parseFloat(order.total),
          Stage: 'Closed Won',
          Contact_Name: {
            id: contactId
          }
        }
      ]
    },
    {
      headers
    }
  );

  console.log(
    `✔ Created Deal for order #${order.id}`
  );
}


// -----------------------------------------
// Main Sync Function
// -----------------------------------------

async function syncOrders() {

  try {

    const token = await getZohoAccessToken();

    const orders = await getRecentOrders();

    console.log(
      `Found ${orders.length} orders`
    );

    for (const order of orders) {

      const contactId =
        await upsertContact(token, order);

      await createDeal(
        token,
        order,
        contactId
      );

      console.log(
        `✔ Synced order #${order.id} → contact ${contactId}`
      );
    }

  } catch (err) {

    console.error(
      'Sync failed:',
      err.response?.data || err.message
    );

  }

}


// -----------------------------------------
// Run immediately
// -----------------------------------------

syncOrders();


// -----------------------------------------
// Run automatically every 60 seconds
// -----------------------------------------

setInterval(() => {

  console.log(
    '\n🔄 Checking WooCommerce for new orders...'
  );

  syncOrders();

}, 60000);