import { CURRENT_STANDARDS } from "@/lib/standards/versions";
import { GS1_APPLICATION_IDENTIFIERS } from "@/lib/standards/gs1/application-identifiers.dictionary";
import { SYMBOLOGY_RULES } from "@/lib/standards/gs1/symbologies";
import { UNITS_OF_MEASURE } from "@/lib/standards/units";
import { DEFAULT_GTIN_MANAGEMENT_RULES } from "@/lib/standards/gs1/gtin-management";
import { Alert } from "@/components/ui/alert";

export default function AdminStandardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Standards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Validation algorithms live in the standards engine and are applied through versioned
          adapters. Ordinary admins cannot change official check-digit or GTIN rules from this screen.
        </p>
      </div>

      <Alert>
        Official GS1 identifiers must be obtained through the applicable GS1 Member Organisation.
        This platform is not GS1 and does not issue GTINs.
      </Alert>

      <section>
        <h2 className="text-sm font-semibold">Standard versions</h2>
        <div className="mt-3 divide-y rounded-xl border border-border">
          {CURRENT_STANDARDS.map((standard) => (
            <div key={standard.key} className="px-4 py-3 text-sm">
              <p className="font-medium">{standard.name}</p>
              <p className="text-muted-foreground">
                Version {standard.version} · {standard.status} · effective {standard.effectiveDate}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">GTIN management rules</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {DEFAULT_GTIN_MANAGEMENT_RULES.map((rule) => (
            <li key={rule.id} className="rounded-lg border border-border px-4 py-3">
              <span className="font-medium">{rule.id}</span>
              <span className="ml-2 text-muted-foreground">
                {rule.decision} · {rule.explanation}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Application Identifiers</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">AI</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Length</th>
              </tr>
            </thead>
            <tbody>
              {GS1_APPLICATION_IDENTIFIERS.map((item) => (
                <tr key={item.ai} className="border-b">
                  <td className="px-4 py-2 font-mono">{item.ai}</td>
                  <td className="px-4 py-2">{item.title}</td>
                  <td className="px-4 py-2">
                    {item.minLength}
                    {item.fixedLength ? "" : `–${item.maxLength}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Symbologies</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {SYMBOLOGY_RULES.map((rule) => (
            <li key={rule.symbology} className="rounded-lg border border-border px-4 py-3">
              <span className="font-medium">{rule.title}</span>
              <span className="ml-2 text-muted-foreground">{rule.typicalUse}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Measurement units</h2>
        <p className="mt-2 flex flex-wrap gap-2 text-sm">
          {UNITS_OF_MEASURE.map((unit) => (
            <span key={unit.code} className="rounded-full border border-border px-3 py-1">
              {unit.code} · {unit.displayUnit}
            </span>
          ))}
        </p>
      </section>
    </div>
  );
}
