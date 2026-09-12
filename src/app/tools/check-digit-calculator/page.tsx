import { ToolShell } from "@/components/tools/tool-shell";
import { CheckDigitTool } from "@/components/tools/check-digit-tool";

export default function CheckDigitPage() {
  return (
    <ToolShell
      title="Check-digit calculator"
      description="Computes the GS1 Modulo-10 check digit for a numeric payload. It does not allocate a GTIN."
    >
      <CheckDigitTool />
    </ToolShell>
  );
}
