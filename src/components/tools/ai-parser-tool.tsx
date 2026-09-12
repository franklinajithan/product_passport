"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseGS1ElementString } from "@/lib/standards/gs1/application-identifiers";

export function AiParserTool() {
  const [value, setValue] = useState("(01)05901234567893(17)270501(10)ABC123");
  const [out, setOut] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseGS1ElementString(value);
    setOut(
      parsed.ok
        ? parsed.values.map((item) => `AI ${item.ai} ${item.title}: ${item.value}`).join("\n")
        : parsed.errors.join("\n"),
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="min-h-24 w-full rounded-md border px-3 py-2 font-mono text-sm"
      />
      <Button type="submit">Parse</Button>
      {out ? <pre className="rounded-xl border border-border p-4 text-sm">{out}</pre> : null}
    </form>
  );
}
