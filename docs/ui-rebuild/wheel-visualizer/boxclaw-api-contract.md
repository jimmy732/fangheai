# BoxClaw API contract: F-Box wheel visualizer

This contract keeps the public storefront thin. The browser never calls an image provider directly, never receives a provider key and never sends billing or model-selection fields.

## Create a job

`POST /api/wheel-visualizer/jobs`

Request: `multipart/form-data`

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `vehicle_image` | file | yes | image/jpeg, image/png, image/webp or image/heic; server re-validates type, dimensions and size |
| `product_id` | string | yes | Must resolve to a wheel in the F-Box catalog |
| `product_name` | string | yes | Display/reference hint; server resolves authoritative catalog data |
| `product_finish` | string | yes | Display/reference hint; server resolves authoritative finish |
| `product_fitment` | string | yes | Display/reference hint; server resolves authoritative fitment |
| `product_image` | string | no | Same-origin reference asset; server may ignore and resolve by product ID |
| `crop` | JSON string | no | `{ "zoom": number, "x": number, "y": number }`; server clamps values |
| `angles` | string | yes | Must be `3`; server may reject other values |

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

1. Authenticate/authorize through the existing BoxClaw gateway/session boundary.
2. Resolve the product by `product_id`; ignore client price and untrusted catalog metadata.
3. Apply the fixed prompt in `boxclaw-fixed-prompt.md`; do not accept a browser prompt override.
4. Use the official F-Box sponsored policy. This job must not decrement customer credits or create a customer charge.
5. Queue one job and persist ownership, status, timestamps and three output references.
6. Do not mark success until three distinct image outputs are available.
7. Apply image retention and deletion policy server-side; the storefront does not persist the uploaded photo.
