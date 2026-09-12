import { ToolShell } from "@/components/tools/tool-shell";
import { GtinNormalizerTool } from "@/components/tools/gtin-normalizer-tool";

export default function NormalizerPage() {
  return (
    <ToolShell
      title="GTIN normaliser"
      description="Shows the printed form and the canonical GTIN-14 used for database comparison."
    >
      <GtinNormalizerTool />
    </ToolShell>
  );
}
