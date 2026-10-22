// window.dataLayer used to come from @next/third-parties' type declarations.
// GTM is now loaded by a plain script in app/layout.tsx, so declare it here.
export {};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
