import { ToolShell } from "@/components/tools/tool-shell";
import { DigitalLinkBuilderTool } from "@/components/tools/digital-link-tool";

export default function DigitalLinkBuilderPage() {
  return (
    <ToolShell
      title="Digital Link builder"
      description="Constructs a GS1 Digital Link URI using /01/{gtin14} syntax. Query-string barcode shortcuts are rejected."
    >
      <DigitalLinkBuilderTool />
    </ToolShell>
  );
}
