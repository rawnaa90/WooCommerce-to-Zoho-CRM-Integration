# WooCommerce to Zoho CRM Integration

**Task Submission** — Local integration between a WooCommerce store and Zoho CRM that automatically syncs customer order data as Contacts and Deals.

---

## 1. Project Overview

This project fulfills the assigned task: build a local integration between a WooCommerce store (WordPress, run locally) and Zoho CRM, so that customer order data is automatically sent from WooCommerce into the CRM as a Contact and a Deal. It was built entirely with free, local tools — LocalWP for WordPress hosting, the WooCommerce REST API, and the Zoho CRM REST API (v8) authenticated via OAuth2 — with no paid plugins, licenses, or external hosting.

## 2. Project Information

| | |
|---|---|
| **Project Name** | WooCommerce to Zoho CRM Integration |
| **Local WordPress Site** | https://wc-crm-demo.local |
| **WooCommerce API Endpoint** | https://wc-crm-demo.local/wp-json/wc/v3/orders |
| **WooCommerce API Version** | v3 |
| **Zoho CRM API Version** | v8 |
| **Zoho CRM Modules Used** | Contacts, Deals |
| **Zoho Accounts Domain** | https://accounts.zoho.com |
| **Zoho API Domain** | https://www.zohoapis.com |
| **Programming Language** | JavaScript / Node.js |
| **Node.js Version** | v26.7.0 |
| **Dependencies** | axios, dotenv |
| **WooCommerce Authentication** | Basic Authentication (Consumer Key + Consumer Secret) |
| **Zoho CRM Authentication** | OAuth 2.0 |
| **Automation Method** | Polling |
| **Polling Interval** | 60 seconds |

## 3. Technologies Used

- **WordPress** — local content management system hosting the store
- **WooCommerce** — e-commerce plugin providing the Orders REST API
- **LocalWP** — local WordPress environment manager (no hosting required)
- **Zoho CRM** — cloud CRM providing Contacts and Deals modules via REST API
- **Node.js** — runtime for the integration script
- **axios** — HTTP client for API requests
- **dotenv** — loads credentials from environment variables
- **Postman** — used to test and validate both APIs during development

## 4. Integration Workflow

Matches the required workflow from the task brief:

1. A customer places an order on the local WooCommerce store.
2. The script fetches the latest order details via the WooCommerce REST API, including:
   - Customer name and email
   - Products ordered
   - Order total
3. The script sends this data to the Zoho CRM API:
   - Creates or updates a **Contact** (customer info) — searches by email first, reuses the existing Contact if found, otherwise creates a new one.
   - Creates a new **Deal** with the order value and a title derived from the order/products, linked to that Contact.
4. The result is verified by logging into Zoho CRM and checking that the Contact and Deal exist.

## 5. Project Structure

```
wc-zoho-integration/
├── index.js              # Main integration script
├── .env                  # Real credentials (not included in submission)
├── .env.example           # Placeholder template for required variables
├── package.json
├── package-lock.json
├── node_modules/            # (not included in submission)
├── README.md
└── screenshots/
    ├── woocommerce-order.png
    ├── successful-sync.png
    ├── zoho-contact.png
    └── zoho-deal.png
```

## 6. Requirements

Task requirements and how each was met:

| Requirement | Status |
|---|---|
| Install LocalWP | ✅ Done |
| Create a local WordPress site | ✅ Done — `wc-crm-demo.local` |
| Install WooCommerce plugin | ✅ Done |
| Add at least 3 sample products | ✅ Done |
| Place 2 test orders as a dummy customer | ✅ Done — verified with orders #16–#18 |
| Sign up for Zoho (Zoho One / Zoho CRM) | ✅ Done |
| Use Zoho CRM API v8 | ✅ Done |
| Authenticate using OAuth2 | ✅ Done — Self Client, refresh-token flow |
| Use CRM modules: Contacts, Deals | ✅ Done |
| Use WooCommerce REST API to read orders | ✅ Done |
| Use CRM API to create/update Contacts and Deals | ✅ Done |
| Verify result in the CRM | ✅ Done — confirmed in Contacts and Deals modules |

Environment needed to run/re-test this submission:
- [LocalWP](https://localwp.com/) with the local WordPress site running
- WooCommerce plugin active, with sample products and test orders in place
- A Zoho account with access to Zoho CRM
- An OAuth2 Self Client registered in the [Zoho API Console](https://api-console.zoho.com/)
- [Node.js](https://nodejs.org/) v18+ (developed on v26.7.0)
- [Postman](https://www.postman.com/) (optional, used for manual API testing)

## 7. Environment Variables

Sensitive credentials are stored in a `.env` file, which is **not included** in this submission. `.env.example` is provided as a template.

| Variable | Description |
|---|---|
| `WC_SITE_URL` | Base URL of the local WooCommerce site |
| `WC_CONSUMER_KEY` | WooCommerce REST API consumer key |
| `WC_CONSUMER_SECRET` | WooCommerce REST API consumer secret |
| `ZOHO_CLIENT_ID` | OAuth2 Client ID from the Zoho API Console |
| `ZOHO_CLIENT_SECRET` | OAuth2 Client Secret from the Zoho API Console |
| `ZOHO_REFRESH_TOKEN` | OAuth2 refresh token used to generate access tokens |
| `ZOHO_ACCOUNTS_DOMAIN` | Zoho accounts domain (e.g. `https://accounts.zoho.com`) |
| `ZOHO_API_DOMAIN` | Zoho CRM API domain (e.g. `https://www.zohoapis.com`) |

**`.env.example`:**
```env
WC_SITE_URL=https://wc-crm-demo.local
WC_CONSUMER_KEY=your_consumer_key
WC_CONSUMER_SECRET=your_consumer_secret

ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_ACCOUNTS_DOMAIN=https://accounts.zoho.com
ZOHO_API_DOMAIN=https://www.zohoapis.com
```

## 8. Installation

1. Clone or download the project folder.
2. Open a terminal in the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the example environment file and fill in your own values:
   ```bash
   cp .env.example .env
   ```

## 9. Configuration

1. Ensure the local WordPress/WooCommerce site is running in LocalWP.
2. Generate WooCommerce REST API keys under **WooCommerce → Settings → Advanced → REST API**, and add them to `.env`.
3. Register a Self Client in the [Zoho API Console](https://api-console.zoho.com/) and generate an authorization code with scopes:
   ```
   ZohoCRM.modules.contacts.ALL,ZohoCRM.modules.deals.ALL
   ```
4. Exchange the authorization code for an access token and refresh token via `POST https://accounts.zoho.com/oauth/v2/token`.
5. Add the resulting `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN` to `.env`.

## 10. How to Run

Run the script once, manually:
```bash
node index.js
```

Run it continuously with polling (checks WooCommerce every 60 seconds):
```bash
node index.js --watch
```

## 11. Expected Output

Console output for a successful run:

```
Found 3 orders
✔ Synced order #16 → contact 4876000000123456 (Deal already exists, skipped)
✔ Synced order #17 → contact 4876000000123457 (Deal already exists, skipped)
✔ Synced order #18 → contact 4876000000123458 (Deal created)
```

Each order results in either a new Contact + Deal, or a reused Contact with the existing Deal left untouched.

## 12. Testing & Verification

The integration was tested end-to-end using real WooCommerce orders and the live Zoho CRM API (no mock data):

- **Order #18** — successfully created a new Deal in Zoho CRM and synchronized the customer Contact.
- **Orders #16 and #17** — existing Deals were correctly detected and skipped, preventing duplicate Deals.
- **Final verification** — Contacts and Deals were confirmed present directly in the Zoho CRM **Contacts** and **Deals** modules.


Screenshots demonstrating the successful integration are included in the `screenshots` directory.
- `woocommerce-order.png` — WooCommerce test order.
- `successful-sync.png` — Successful Node.js synchronization output.
- `zoho-contact.png` — Customer Contact created/synchronized in Zoho CRM.
- `zoho-deal.png` — Deal created in Zoho CRM from the WooCommerce order.

## 13. Automation

- The script uses **polling** rather than webhooks, since the local WordPress site is not publicly reachable and Zoho cannot deliver real-time webhooks to it.
- WooCommerce is checked for new orders every **60 seconds**.
- Duplicate-prevention logic (checking for an existing Deal per order number, and an existing Contact per email) makes repeated runs safe without creating duplicate CRM records.

## 14. Security

- All API credentials and OAuth tokens are stored in a local `.env` file, excluded from this submission.
- `.env.example` contains placeholder values only — no real keys or tokens.
- No real customer passwords, payment details, or other sensitive personal information are used or stored anywhere in the project; all customer data is dummy/test data.
- Zoho CRM access uses OAuth 2.0 rather than static credentials, and access tokens are short-lived, refreshed via the stored refresh token.

## 15. APIs Used

- **WooCommerce REST API** — `https://wc-crm-demo.local/wp-json/wc/v3/orders` (v3), authenticated via Basic Auth with Consumer Key/Secret.
  Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
- **Zoho CRM REST API** — `https://www.zohoapis.com/crm/v8/` (Contacts, Deals modules), authenticated via OAuth 2.0.
  Docs: https://www.zoho.com/crm/developer/docs/api/v8/

## 16. Project Status

**Status:** Complete — all task requirements met and verified.

The integration successfully fetches WooCommerce orders, creates/reuses Zoho CRM Contacts, creates linked Deals, and prevents duplicate Deals on repeated runs. Verified end-to-end against orders #16–#18, with corresponding Contact and Deal records confirmed in Zoho CRM.

---

## Features

- Fetches recent orders from WooCommerce.
- Creates new Contacts in Zoho CRM.
- Reuses existing Contacts when the customer already exists.
- Creates Deals for WooCommerce orders.
- Links Deals to the corresponding Contacts.
- Prevents duplicate Deals for previously processed orders.
- Automatically checks WooCommerce for new orders.
- Uses OAuth 2.0 for Zoho CRM API authentication.
- Uses environment variables to protect sensitive credentials.

---

## What This Demonstrates

In line with the task's learning objectives, this project demonstrates practical experience with:

- **Working with REST APIs** — consuming the WooCommerce Orders API and the Zoho CRM Contacts/Deals APIs.
- **OAuth2 / API tokens** — implementing the full OAuth2 authorization-code and refresh-token flow for Zoho CRM, alongside Basic Auth (Consumer Key/Secret) for WooCommerce.
- **Data mapping and integration logic** — translating WooCommerce order fields (billing info, line items, total) into Zoho CRM Contact and Deal fields.
- **CRM module structure** — working directly with the Contacts and Deals modules and their relationship (Deal → Contact_Name lookup).
- **Testing integrations locally** — validating both APIs independently in Postman before writing the integration script, then testing the full flow against real local WooCommerce orders and the live Zoho CRM API.
