import { ToolShell } from "@/components/tools/tool-shell";
import { GtinValidatorTool } from "@/components/tools/gtin-validator-tool";

export default function GtinValidatorPage() {
  return (
    <ToolShell
      title="GTIN validator"
      description="Checks numeric form, permitted length and GS1 Modulo-10 check digit. A valid check digit is not official ownership."
    >
      <GtinValidatorTool />
    </ToolShell>
  );
}
