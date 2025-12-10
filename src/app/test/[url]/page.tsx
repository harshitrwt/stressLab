// src/app/test/[url]/page.tsx
import LatencyGraph from "../../components/LatencyGraph";
import GlobalMap from "../../components/GlobalMap";
import WaterfallChart from "../../components/waterfallChart";
import ScoreCard from "../../components/ScoreCard";
import LiveUpdates from "../../components/LiveUpdates";

export default async function TestDashboard(props: { params: Promise<{ url: string }> }) {
  const { url } = await props.params;
  const target = decodeURIComponent(url);

  return (
    <main className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Testing: {target}</h2>

      <ScoreCard target={target} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatencyGraph target={target} />
        <WaterfallChart target={target} />
      </div>

      <GlobalMap target={target} />

      <LiveUpdates target={target} />
    </main>
  );
}
