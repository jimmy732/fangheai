# Verification Matrix: F-Box wheel visualizer

This matrix records the local wiring for the five-step sponsored visualizer. It does not claim that a real provider image was generated while the local BoxClaw runtime is in `mock` mode.

| Check | Expected | Local evidence | Result |
| --- | --- | --- | --- |
| Product entry | Wheel product detail keeps the existing product, price, gallery, reviews, cart and checkout behavior | `#product/fbox-axis-19` entry card is rendered beside the existing detail form | Pass |
| Five-step rail | Upload, Frame, Reference, Generate, Results | `app.js` step rail has `01`–`05`; `results` activates step 05 | Pass |
| Vehicle upload | User photo is held transiently in memory | FileReader/object URL path; no new visualizer localStorage key | Pass |
| Framing | Zoom/x/y update the image above immediately | `data-wheel-crop` input and drag handlers update the crop image | Pass |
| Wheel reference | Selecting another gallery thumbnail changes the selected reference before generation | `wheel-reference` updates `state.wheelVisualizer.referenceImage`; reference step displays the selected image | Pass |
| Public request boundary | Browser sends JSON only to same-origin `/api/wheel-visualizer/jobs` | No provider key, prompt, model, credits or price fields in `wheelVisualizerRemoteJob` | Pass |
| Local bridge | 4174 forwards to 8001 with the integration header | `local-fbox-server.mjs` route and `X-F-Box-Visualizer-Token` forwarding | Pass |
| Admin configuration | Operator configures image route through `http://localhost:8081/admin` | Admin UI is separate from public storefront; API runtime is 8001 | Pass |
| Mock runtime | No false AI success when BoxClaw is not live | 8001 returns 503 for mock/no image route; frontend renders labeled local layout preview | Pass |
| Live runtime contract | Three parallel `gpt-image-2` calls use fixed server prompt and selected wheel reference | `admin-backend/app/api/v1/routes/fbox_visualizer.py` calls `ModelClick().image` with `input_fidelity="high"` | Ready; provider route not enabled locally |
| Commerce isolation | Visualizer does not change fitment, product price, reviews, cart or checkout | Separate `state.wheelVisualizer`; existing handlers unchanged | Pass |
| Recovery | Retry and choose another photo keep the flow recoverable | `wheel-reset`, `wheel-retry`, reference back/next handlers | Pass |

## To enable real output locally

1. Open `http://localhost:8081/admin` and configure/enable a BoxClaw image route that supports the image model path.
2. Set the admin-backend runtime to `AI_PROVIDER_MODE=live`, then restart the 8001 service so its settings are reloaded.
3. Keep the same `FBOX_VISUALIZER_INTEGRATION_TOKEN` on the 8001 service and the 4174 proxy if running outside development defaults.
4. Re-run the visualizer. The UI should move from `queued/running` to three result URLs; otherwise it will show a safe error rather than provider internals.
