// Page context for the site-wide conversation agent.
//
// The floating SiteAgent mounts once in the root layout, so it cannot
// receive props from the page it sits on. Pages that have something the
// agent should know about (a blog post body, a product demo context)
// publish it here from a small client component (AgentPageContext), and
// the SiteAgent subscribes. Pages that publish nothing get the agent's
// home-page behaviour from the API's fallback.

export type AgentArticleContext = {
  title?: string;
  articleSection?: string;
  metaDescription?: string;
  bodyPlain?: string;
};

type Listener = () => void;

let current: AgentArticleContext = {};
const listeners = new Set<Listener>();

export function setAgentPageContext(next: AgentArticleContext) {
  current = next;
  listeners.forEach((l) => l());
}

export function clearAgentPageContext() {
  setAgentPageContext({});
}

export function getAgentPageContext() {
  return current;
}

export function subscribeAgentPageContext(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const EMPTY: AgentArticleContext = {};
export function getServerAgentPageContext() {
  return EMPTY;
}
