import LatencyGraph from "../../components/LatencyGraph";
import GlobalMap from "../../components/GlobalMap";
import WaterfallChart from "../../components/waterfallChart";
import ScoreCard from "../../components/ScoreCard";
import LiveUpdates from "../../components/LiveUpdates";
import SitePreview from "../../components/sitePreview";

export default async function TestDashboard(props: { params: Promise<{ url: string }> }) {
  const { url } = await props.params;
  const target = decodeURIComponent(url);

  return (
    <main className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Testing: {target}</h2>

      {/* Performance on left — Preview on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
        <ScoreCard target={target} /> 
        <LatencyGraph target={target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterfallChart target={target} />
        <SitePreview url={target} />
      </div>

      <GlobalMap target={target} />

      <LiveUpdates target={target} />
    </main>
  );
}
