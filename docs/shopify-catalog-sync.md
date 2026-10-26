# Shopify catalog on forcarbox.cn

Updated 2026-10-27. This adds direct product purchasing through the existing Shopify store while retaining CIRUI's factory, motorsport, Fitment Lab, custom quotation and AI tools.

## Public customer flow

- All wheels: https://forcarbox.cn/#store
- Collections: https://forcarbox.cn/#collections
- Collection: /#collection/<Shopify collection handle>
- Detail: /#shopify-product/<Shopify product handle>
- Choose the actual Shopify options and a quantity. The button is enabled only for one exact available variant.
- Continue to Shopify uses /api/shopify/checkout?product=<handle>&variant=<numeric variant ID>&quantity=1. The server checks product membership, the imported availability and an integer quantity 1–99, then redirects to this store's official cart permalink.
- Shopify confirms final stock, shipping, tax and available payment methods. PayPal is chosen in Shopify's checkout when offered; the website does not create a separate PayPal payment, set a payment amount, promise installments, or mark the order paid from a click.
- Quantity 1 is one listed item/set. Do not multiply a four-wheel-set price by the old RFQ minimum of four wheels.

The old fixed PayPal direct-product script is no longer loaded, and its public hosted-button entry points are disabled. Private quotation/invoice flows and the legacy RFQ catalog remain separate at /#rfq-catalog.

## Current import and publication boundary

This release imports the current approved public snapshot: 156 products, 15,954 variants, 20 collections and 1,200 product images. Three customer-specific contract/payment products remain in Shopify for their original purpose and are excluded from the public selection catalog. No Shopify products, prices, inventory, payments or orders are changed by this website integration.

The 96 Judge.me reviews and 109 pictures were rechecked through the current public widget, including every page and UUID. 28 reviews retain their exact public product association. 68 reviews historically associated with a customer-specific payment item are shown only in overall customer feedback, not attached to unrelated wheel designs. Imported reviews do not receive a fabricated verified-purchase badge. Placeholder reviewer labels were anonymized as Customer.

## Data and server endpoints

- data/shopify-public-catalog.json: curated public products, complete variant options and collection membership.
- data/shopify-public-reviews.json: curated product reviews and overall customer feedback.
- shopify-catalog-backend.mjs: explicit field allowlist, HTML sanitization (xss 1.0.17, compatible with the existing Node 20 server), response compression, valid checkout destinations and last-good snapshot retention.
- GET /api/shopify/catalog: lightweight cards/collections (no full variant arrays or full HTML).
- GET /api/shopify/products/:handle: exact detail, complete variants, media and sanitized HTML.
- GET /api/shopify/reviews: public reviews with explicit scope. Optional product_id only returns exact product reviews.
- GET /api/shopify/checkout: validates the imported product/variant before redirecting to Shopify.

No Admin API token, Judge.me private key or customer contact data is embedded. These are current import snapshots, not a background scheduler or webhook integration. The API reports synced_at; Shopify remains authoritative at checkout. If replacing a snapshot fails validation, a running process retains its last valid copy.

## Refreshing a reviewed import

Export the current ACTIVE Online Store products, complete variant pagination, public collections and currently published Judge.me reviews. Reconcile private customer payment links and review scope before import. Never deploy the raw Admin exports, internal hold ledger or customer fields.

Run from this checkout with the two curated export files:

    node scripts/import-shopify-public-snapshot.mjs /absolute/path/catalog.json /absolute/path/reviews.json

The importer validates both files, removes nonpublic fields, sanitizes descriptions and atomically replaces each public file. It prints counts and SHA-256 values. The running API checks file timestamps and loads a valid replacement without requiring a restart.

## Validation and production identity

    node --check app.js
    node --check shopify-catalog-ui.js
    node --check shopify-catalog-backend.mjs
    node scripts/qa-shopify-sync.mjs --base=http://127.0.0.1:17831

The independent QA script accepts only a local origin, compares all products and variants with the reviewed source, requests checkout redirects without following them, and tests sanitizer, review moderation and last-good fixtures. It does not submit orders or payments.

Deployment identity remains deploy/README.md: jimmy732/fangheai, branch agent/f-box-site-deploy, /opt/fbox/fangheai, fbox.service. Preserve server runtime data, environment files, secrets and the pre-existing untracked package-lock.json. Do not deploy this checkout to crforged.cn.
