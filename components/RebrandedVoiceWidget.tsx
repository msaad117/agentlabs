"use client";

import { useEffect, useRef } from "react";

type RebrandedVoiceWidgetProps = {
  agentId: string;
  brandName?: string;
  brandInitials?: string;
  tagline?: string;
  accentColor?: string;
};

const WIDGET_SCRIPT_URL = "https://unpkg.com/@elevenlabs/convai-widget-embed";

const DEFAULTS = {
  brandName: "Atlas Concierge",
  brandInitials: "AC",
  tagline: "Virtual voice partner",
  accentColor: "#7c3aed"
};

declare global {
  interface Window {
    __atlasConvaiScript?: HTMLScriptElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      "atlas-convai-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "agent-id"?: string;
        "brand-name"?: string;
        "brand-initials"?: string;
        tagline?: string;
        "accent-color"?: string;
      };
    }
  }
}

function ensureScript(onReady: () => void) {
  if (typeof window === "undefined") return;

  let script = window.__atlasConvaiScript ?? document.querySelector<HTMLScriptElement>(
    `script[src="${WIDGET_SCRIPT_URL}"]`
  );

  const handleLoad = () => {
    if (!script) return;
    script.dataset.loaded = "true";
    script.removeEventListener("load", handleLoad);
    onReady();
  };

  if (script) {
    window.__atlasConvaiScript = script;
    if (script.dataset.loaded === "true") {
      onReady();
    } else {
      script.addEventListener("load", handleLoad, { once: true });
    }
    return;
  }

  script = document.createElement("script");
  script.src = WIDGET_SCRIPT_URL;
  script.async = true;
  script.type = "text/javascript";
  script.dataset.source = "atlas-convai";
  script.addEventListener("load", handleLoad, { once: true });
  document.body.appendChild(script);
  window.__atlasConvaiScript = script;
}

function defineRebrandedElement() {
  if (typeof window === "undefined") return;
  if (window.customElements.get("atlas-convai-widget")) {
    return;
  }

  class AtlasConvaiWidget extends HTMLElement {
    static get observedAttributes() {
      return [
        "agent-id",
        "brand-name",
        "brand-initials",
        "tagline",
        "accent-color"
      ];
    }

    connectedCallback() {
      if (this.shadowRoot) {
        return;
      }

      const shadow = this.attachShadow({ mode: "open" });
      const container = document.createElement("section");
      container.className = "atlas-widget";

      const header = document.createElement("header");
      header.className = "atlas-widget__header";

      const avatar = document.createElement("span");
      avatar.className = "atlas-widget__avatar";

      const meta = document.createElement("div");
      meta.className = "atlas-widget__meta";

      const title = document.createElement("span");
      title.className = "atlas-widget__title";

      const subtitle = document.createElement("span");
      subtitle.className = "atlas-widget__subtitle";

      const widget = document.createElement("elevenlabs-convai");

      header.append(avatar, meta);
      meta.append(title, subtitle);
      container.append(header, widget);

      const style = document.createElement("style");
      style.textContent = this.composeStyles();

      shadow.append(style, container);

      this.updateAccentColor(this.getAttribute("accent-color"));
      this.updateBrandName(this.getAttribute("brand-name"));
      this.updateBrandInitials(this.getAttribute("brand-initials"));
      this.updateTagline(this.getAttribute("tagline"));
      this.updateAgentId(this.getAttribute("agent-id"));
    }

    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
      switch (name) {
        case "agent-id":
          this.updateAgentId(newValue);
          break;
        case "brand-name":
          this.updateBrandName(newValue);
          break;
        case "brand-initials":
          this.updateBrandInitials(newValue);
          break;
        case "tagline":
          this.updateTagline(newValue);
          break;
        case "accent-color":
          this.updateAccentColor(newValue);
          break;
        default:
          break;
      }
    }

    private updateAgentId(agentId: string | null) {
      const embed = this.shadowRoot?.querySelector("elevenlabs-convai");
      if (!embed || !agentId) {
        return;
      }
      embed.setAttribute("agent-id", agentId);
    }

    private updateBrandName(brandName: string | null) {
      const title = this.shadowRoot?.querySelector<HTMLElement>(".atlas-widget__title");
      const resolved = brandName?.trim() || DEFAULTS.brandName;
      if (title) {
        title.textContent = resolved;
      }
      if (!this.hasAttribute("brand-initials")) {
        this.updateBrandInitials(this.initialsFrom(resolved));
      }
    }

    private updateBrandInitials(initials: string | null) {
      const avatar = this.shadowRoot?.querySelector<HTMLElement>(".atlas-widget__avatar");
      const title = this.shadowRoot?.querySelector<HTMLElement>(".atlas-widget__title");
      const fallback = this.initialsFrom(title?.textContent || DEFAULTS.brandName);
      if (avatar) {
        avatar.textContent = (initials?.trim() || fallback).slice(0, 3).toUpperCase();
      }
    }

    private updateTagline(tagline: string | null) {
      const subtitle = this.shadowRoot?.querySelector<HTMLElement>(".atlas-widget__subtitle");
      if (subtitle) {
        subtitle.textContent = tagline?.trim() || DEFAULTS.tagline;
      }
    }

    private updateAccentColor(accentColor: string | null) {
      const resolved = accentColor?.trim() || DEFAULTS.accentColor;
      this.style.setProperty("--atlas-accent", resolved);
    }

    private initialsFrom(value: string) {
      const parts = value.split(/\s+/).filter(Boolean).slice(0, 2);
      if (parts.length === 0) {
        return DEFAULTS.brandInitials;
      }
      return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || DEFAULTS.brandInitials;
    }

    private composeStyles() {
      return `
        :host {
          --atlas-accent: ${DEFAULTS.accentColor};
          display: block;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .atlas-widget {
          border-radius: 24px;
          overflow: hidden;
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(148, 163, 184, 0.16);
          backdrop-filter: blur(12px);
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.35);
          display: grid;
          grid-template-rows: auto 1fr;
        }

        .atlas-widget__header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1.25rem 1.5rem;
          background: linear-gradient(120deg, var(--atlas-accent), color-mix(in srgb, var(--atlas-accent) 40%, black));
          color: #f8fafc;
        }

        .atlas-widget__avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          background: rgba(15, 23, 42, 0.25);
          border: 1px solid rgba(248, 250, 252, 0.35);
          letter-spacing: 0.05em;
        }

        .atlas-widget__meta {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .atlas-widget__title {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .atlas-widget__subtitle {
          font-size: 0.85rem;
          color: rgba(226, 232, 240, 0.8);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        elevenlabs-convai {
          min-height: 420px;
          width: 100%;
          border: none;
          background: transparent;
        }

        elevenlabs-convai::part(brand),
        elevenlabs-convai::part(powered-by) {
          display: none !important;
        }
      `;
    }
  }

  window.customElements.define("atlas-convai-widget", AtlasConvaiWidget);
}

export default function RebrandedVoiceWidget({
  agentId,
  brandName = DEFAULTS.brandName,
  brandInitials,
  tagline = DEFAULTS.tagline,
  accentColor = DEFAULTS.accentColor
}: RebrandedVoiceWidgetProps) {
  const hostRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    ensureScript(() => {
      defineRebrandedElement();
    });
  }, []);

  useEffect(() => {
    const element = hostRef.current;
    if (!element) {
      return;
    }

    element.setAttribute("agent-id", agentId);
    element.setAttribute("brand-name", brandName);
    element.setAttribute("tagline", tagline);
    element.setAttribute("accent-color", accentColor);
    if (brandInitials) {
      element.setAttribute("brand-initials", brandInitials);
    } else {
      element.removeAttribute("brand-initials");
    }
  }, [agentId, brandName, brandInitials, tagline, accentColor]);

  return (
    <atlas-convai-widget
      ref={(value) => {
        hostRef.current = value as HTMLElement | null;
      }}
      className="atlas-convai-host"
    />
  );
}
