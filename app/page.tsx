import dynamic from "next/dynamic";

const RebrandedVoiceWidget = dynamic(
  () => import("@/components/RebrandedVoiceWidget"),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <h1>Atlas Voice Concierge</h1>
        <p>
          Embed a fully rebranded conversational agent without exposing the
          underlying ElevenLabs implementation. This demo shows how you can
          recolor, rename, and frame the experience inside your own Next.js
          application.
        </p>
      </section>
      <section className="widget-panel">
        <RebrandedVoiceWidget
          agentId="agent_0501k5etps9qftvapxkqg7bbx0es"
          brandName="Atlas Concierge"
          brandInitials="AC"
          tagline="Always-on voice partner"
          accentColor="#7c3aed"
        />
      </section>
    </main>
  );
}
