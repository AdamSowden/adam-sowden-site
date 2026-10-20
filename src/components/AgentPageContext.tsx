"use client";

import { useEffect } from "react";
import {
  clearAgentPageContext,
  setAgentPageContext,
  type AgentArticleContext,
} from "@/lib/agent-page-context";

// Renders nothing. Publishes this page's context to the floating
// SiteAgent for as long as the page is mounted. See agent-page-context.ts.
export default function AgentPageContext({
  article,
}: {
  article: AgentArticleContext;
}) {
  useEffect(() => {
    setAgentPageContext(article);
    return () => clearAgentPageContext();
    // The article object is built fresh by a server component on each
    // render; compare by its fields so a stable page does not re-publish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    article.title,
    article.articleSection,
    article.metaDescription,
    article.bodyPlain,
  ]);
  return null;
}
