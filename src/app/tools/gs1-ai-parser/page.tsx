import { ToolShell } from "@/components/tools/tool-shell";
import { AiParserTool } from "@/components/tools/ai-parser-tool";

export default function AiParserPage() {
  return (
    <ToolShell
      title="GS1 AI parser"
      description="Parses an element string into Application Identifiers instead of treating the whole payload as a barcode."
    >
      <AiParserTool />
    </ToolShell>
  );
}
