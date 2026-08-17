# BoxClaw API contract: F-Box wheel visualizer

This contract keeps the public storefront thin. The browser never calls an image provider directly, never receives a provider key and never sends billing or model-selection fields.

## Create a job

`POST /api/wheel-visualizer/jobs`

The public endpoint is a same-origin 4174 adapter. In the current local setup it forwards to `POST http://127.0.0.1:8001/api/v1/fbox/wheel-visualizer/jobs`. The operator configures the route in `http://localhost:8081/admin`; the UI itself is not a public API.

Request: `application/json`

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `vehicle_image` | string data URL | yes | `data:image/...;base64,...`; the adapter converts the selected file in memory and the server re-validates type, dimensions and size |
| `product_id` | string | yes | Must resolve to a wheel in the F-Box catalog |
| `product_name` | string | yes | Display/reference hint; server resolves authoritative catalog data |
| `product_finish` | string | yes | Display/reference hint; server resolves authoritative finish |
| `product_fitment` | string | yes | Display/reference hint; server resolves authoritative fitment |
| `product_image` | string data URL | yes | Selected gallery reference; server uses it as the authoritative wheel image |
| `crop` | object | no | `{ "zoom": number, "x": number, "y": number }`; server clamps values |
| `angles` | number | yes | Must be `3`; server may reject other values |

The browser deliberately does not send `model`, `api_key`, `provider`, `credits`, `price`, `plan`, `prompt` or `quality` fields.

Response `202 Accepted`:

```json
{
  "data": {
    "job_id": "wv_01J...",
    "status": "queued"
  }
}
```

The server may return `200` with `status: "succeeded"` for a synchronous test adapter. The browser accepts either shape.

## Read a job

`GET /api/wheel-visualizer/jobs/:job_id`

```json
{
  "data": {
    "job_id": "wv_01J...",
    "status": "succeeded",
    "mode": "boxclaw",
    "results": [
      { "id": "front-left", "angle": "front_left", "image_url": "https://cdn.example/fbox/wv_01/front-left.webp", "width": 1536, "height": 1024 },
      { "id": "front-right", "angle": "front_right", "image_url": "https://cdn.example/fbox/wv_01/front-right.webp", "width": 1536, "height": 1024 },
      { "id": "side-profile", "angle": "side_profile", "image_url": "https://cdn.example/fbox/wv_01/side-profile.webp", "width": 1536, "height": 1024 }
    ]
  }
}
```

Valid statuses: `queued`, `running`, `succeeded`, `failed`, `canceled`.

Failure response:

```json
{
  "error": { "code": "IMAGE_JOB_FAILED", "message": "We could not finish this preview. Please try again." }
}
```

Do not return provider error bodies, prompts, internal model names, API keys, margin, token usage or customer billing data.

## Server invariants

1. Authenticate the 4174-to-8001 bridge with the server-side `FBOX_VISUALIZER_INTEGRATION_TOKEN`; do not send it from browser JavaScript.
2. Resolve/validate the product by `product_id`; ignore client price and untrusted catalog metadata for commerce.
3. Apply the fixed prompt in `boxclaw-fixed-prompt.md`; do not accept a browser prompt override.
4. Use the official F-Box sponsored policy. This job must not decrement customer credits or create a customer charge.
5. Queue one job through the BoxClaw image route and persist ownership, status, timestamps and three output references in the production job store. The current local bridge uses an in-memory store for development only.
6. Do not mark success until three distinct image outputs are available.
7. Apply image retention and deletion policy server-side; the storefront does not persist the uploaded photo.

## Local route and fallback

The local admin-backend route is `/api/v1/fbox/wheel-visualizer/jobs`. It requires `X-F-Box-Visualizer-Token`, accepts only the fixed three-angle payload, routes through BoxClaw `ModelClick` with `gpt-image-2`, and returns safe job status/results without provider details. When `AI_PROVIDER_MODE=mock` or no enabled image route is configured, it returns `503`; the storefront then renders an explicitly labeled local layout preview so the five-step interaction remains testable without pretending that AI output was generated.
