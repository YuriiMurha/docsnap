import type { MatchStatus } from "@/types";

const COLOR: Record<MatchStatus, string> = {
  OK: "bg-status-ok",
  MISSING: "bg-status-missing",
  EXTRA: "bg-status-extra",
  PARTIAL: "bg-status-partial",
};

export function StatusDot({ status, size = 12 }: { status: MatchStatus; size?: number }) {
  return (
    <span
      className={`inline-block rounded-full ${COLOR[status]}`}
      style={{ width: size, height: size }}
      aria-label={status}
    />
  );
}
