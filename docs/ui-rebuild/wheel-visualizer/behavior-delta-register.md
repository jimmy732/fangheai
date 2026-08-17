# Behavior Delta Register: wheel visualizer

| Delta ID | Requested change | Existing contract | Decision | Implementation | Verification |
| --- | --- | --- | --- | --- | --- |
| D-001 | Add preview flow only for wheel product detail pages | Existing catalog, vehicle, cart and checkout flows remain frozen | Approved by the current task | `app.js`, `styles.css` and scoped docs | Browser/local flow passed |
| D-002 | Add an explicit fifth Results step and a separate wheel-reference step | Previous preview prototype moved directly from crop to generation | Approved | Five-step rail; `reference` state; selected gallery image is sent as product reference | Static state/network checks |
| D-003 | Connect the storefront to local BoxClaw at 8001 while keeping Admin UI at 8081 operator-only | Independent static prototype had no real server bridge | Approved | 4174 proxy + `/api/v1/fbox/wheel-visualizer` route in admin-backend | Authorized route and mock-mode 503 checked |
| D-004 | Keep generation free for the customer | Existing product commerce flows use their own cart/checkout state | Approved | No credit, price or billing fields; BoxClaw route uses F-Box sponsorship | Payload inspection and UI copy |

No existing business behavior was intentionally changed.
