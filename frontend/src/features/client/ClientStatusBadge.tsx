import { Badge } from "@/components/ui/Badge";
import type { ClientStatus } from "./clientStatus";

const TONE: Record<ClientStatus["tone"], "green" | "amber" | "blue" | "red" | "grey"> = {
  green: "green",
  amber: "amber",
  blue: "blue",
  red: "red",
  grey: "grey",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge tone={TONE[status.tone]} dot>
      {status.label}
    </Badge>
  );
}
