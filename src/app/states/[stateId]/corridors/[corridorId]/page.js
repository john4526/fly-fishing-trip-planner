import { notFound } from "next/navigation";
import { STATES } from "@/config/rivers";
import CorridorDetails from "@/app/components/CorridorDetails";

export default async function CorridorPage({ params }) {
  const { stateId, corridorId } = await params;
  const state = STATES[stateId];

  if (!state) {
    notFound();
  }

  const corridor = state.corridors.find((c) => c.id === corridorId);

  if (!corridor) {
    notFound();
  }

  return <CorridorDetails corridor={corridor} stateId={stateId} stateName={state.name} />;
}
