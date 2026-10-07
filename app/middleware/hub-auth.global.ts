// The hub is now hosted behind Cloudflare Access (Okta) at
// sellerxp-prototypes.backmarket.io, which gates every route at the edge.
// No in-app auth gate anymore; kept as a no-op so nothing breaks.
export default defineNuxtRouteMiddleware(() => {})
