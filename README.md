# WooCommerce to Zoho CRM Integration

A local integration that automatically syncs WooCommerce order data into Zoho CRM, creating Contacts and Deals for every new order — with duplicate prevention and OAuth2-secured API access.

---

## 1. Project Overview

This project connects a local WooCommerce store (running on WordPress via LocalWP) to Zoho CRM. When a customer places an order, a Node.js script fetches the order details from the WooCommerce REST API and pushes them into Zoho CRM: creating or reusing a **Contact** for the customer, and creating a **Deal** representing the order, linked to that Contact. The integration was built to demonstrate REST API integration, OAuth2 authentication, and data mapping between an e-commerce platform and a CRM — entirely with free, local tools.

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

1. A customer places an order on the local WooCommerce store.
2. The script polls the WooCommerce REST API for new/recent orders (`status: processing, completed`).
3. For each order, the script extracts:
   - Customer name and email
   - Products ordered
   - Order total
4. The script authenticates with Zoho CRM using OAuth 2.0 and:
   - Searches for an existing Contact by email
     - If found → reuses the existing Contact
     - If not found → creates a new Contact
   - Checks whether a Deal already exists for that order number
     - If it exists → skips it (prevents duplicates)
     - If not → creates a new Deal with the order total and product names, linked to the Contact
5. Results are logged to the console for each processed order.
6. The Contact and Deal can then be verified directly in Zoho CRM.

## 5. Project Structure

```
wc-zoho-integration/
├── index.js              # Main integration script
├── .env                  # Real credentials (not included in submission)
├── .env.example           # Placeholder template for required variables
├── package.json
├── package-lock.json
├── node_modules/
├── README.md
└── screenshots/
    ├── woocommerce-order.png
    ├── successful-sync.png
    ├── zoho-contact.png
    └── zoho-deal.png
```

## 6. Requirements

- [LocalWP](https://localwp.com/) installed, with a local WordPress site running
- WooCommerce plugin installed and activated on that site
- At least 3 sample products and 2+ test orders created in WooCommerce
- A Zoho account with access to Zoho CRM (Zoho One free trial or Zoho CRM free plan)
- A registered OAuth2 Self Client in the [Zoho API Console](https://api-console.zoho.com/)
- [Node.js](https://nodejs.org/) v18+ installed (developed on v26.7.0)
- [Postman](https://www.postman.com/) (optional, used for manual API testing)

## 7. Environment Variables

Sensitive credentials are stored in a `.env` file, which is **not included** in the project submission. Use `.env.example` as a template.

Required variables:

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
*(or however polling is triggered in your version of the script — e.g. `setInterval`/`node-cron` configured for a 60-second interval)*

## 11. Expected Output

Console output for a successful run looks like:

```
Found 3 orders
✔ Synced order #16 → contact 4876000000123456 (Deal already exists, skipped)
✔ Synced order #17 → contact 4876000000123457 (Deal already exists, skipped)
✔ Synced order #18 → contact 4876000000123458 (Deal created)
```

Each order results in either a new Contact + Deal, or a reused Contact with the existing Deal left untouched.

## 12. Testing & Verification

The integration was tested with WooCommerce orders **#16, #17, and #18**:

- **Order #18** — successfully created a new Deal in Zoho CRM and synchronized the customer Contact.
- **Orders #16 and #17** — existing Deals were correctly detected and skipped, preventing duplicate Deals.
- **Final verification** — both Contacts and Deals were confirmed present in Zoho CRM by checking the **Contacts** and **Deals** modules directly.

Screenshots documenting each step are included in the `screenshots/` folder:
- `woocommerce-order.png` — test order in the WooCommerce admin
- `successful-sync.png` — console output of a successful sync run
- `zoho-contact.png` — resulting Contact in Zoho CRM
- `zoho-deal.png` — resulting Deal in Zoho CRM

## 13. Automation

- The script uses **polling** rather than webhooks, since the local WordPress site is not publicly reachable and Zoho cannot send real-time webhooks to it.
- The script checks WooCommerce for new orders every **60 seconds**.
- Duplicate-prevention logic (checking for an existing Deal per order number, and an existing Contact per email) makes it safe to run repeatedly without creating duplicate CRM records.

## 14. Security

- All API credentials and OAuth tokens are stored in a local `.env` file, which is excluded from the project submission.
- `.env.example` contains placeholder values only — no real keys or tokens.
- No real customer passwords, payment details, or other sensitive personal information are used or stored anywhere in the project; all customer data is dummy/test data.
- Zoho CRM access uses OAuth 2.0 rather than static credentials, and access tokens are short-lived (refreshed via the stored refresh token).

## 15. APIs Used

- **WooCommerce REST API** — `https://wc-crm-demo.local/wp-json/wc/v3/orders` (v3), authenticated via Basic Auth with Consumer Key/Secret.
  Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/
- **Zoho CRM REST API** — `https://www.zohoapis.com/crm/v8/` (Contacts, Deals modules), authenticated via OAuth 2.0.
  Docs: https://www.zoho.com/crm/developer/docs/api/v8/

## 16. Project Status

**Status:** Complete and tested.

The integration successfully fetches WooCommerce orders, creates/reuses Zoho CRM Contacts, creates linked Deals, and prevents duplicate Deals on repeated runs. Verified end-to-end against orders #16–#18 with corresponding Contact and Deal records confirmed in Zoho CRM.

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
