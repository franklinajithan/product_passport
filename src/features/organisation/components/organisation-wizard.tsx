"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrganisationAction } from "@/features/organisation/actions";
import { organisationWizardSchema, type OrganisationWizardInput } from "@/validation/organisation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type CountryOption = { id: string; name: string; iso2: string };

const STEPS = [
  "Company",
  "Address",
  "Contact",
  "Brands",
  "Review",
] as const;

export function OrganisationWizard({
  countries,
  defaultType,
}: {
  countries: CountryOption[];
  defaultType: OrganisationWizardInput["type"];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [brandDraft, setBrandDraft] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");

  const form = useForm<OrganisationWizardInput>({
    resolver: zodResolver(organisationWizardSchema),
    defaultValues: {
      type: defaultType,
      name: "",
      legalName: "",
      registrationNumber: "",
      vatNumber: "",
      countryId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      website: "",
      businessEmail: "",
      contactPerson: "",
      phone: "",
      gs1CompanyPrefix: "",
      brands: [],
    },
  });

  const brands = form.watch("brands");
  const values = form.watch();

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) {
      return countries.slice(0, 40);
    }
    return countries
      .filter(
        (country) =>
          country.name.toLowerCase().includes(query) ||
          country.iso2.toLowerCase().includes(query),
      )
      .slice(0, 40);
  }, [countries, countryQuery]);

  async function nextStep() {
    const fieldsByStep: Array<(keyof OrganisationWizardInput)[]> = [
      ["type", "name", "legalName", "registrationNumber", "vatNumber"],
      ["countryId", "addressLine1", "addressLine2", "city", "region", "postalCode"],
      ["website", "businessEmail", "contactPerson", "phone"],
      ["gs1CompanyPrefix", "brands"],
      [],
    ];

    const valid = await form.trigger(fieldsByStep[step], { shouldFocus: true });
    if (valid) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }
  }

  function addBrand() {
    const next = brandDraft.trim();
    if (!next) {
      return;
    }
    const current = form.getValues("brands");
    if (!current.includes(next)) {
      form.setValue("brands", [...current, next], { shouldValidate: true });
    }
    setBrandDraft("");
  }

  async function onSubmit(data: OrganisationWizardInput) {
    setPending(true);
    setSubmitError(null);
    const result = await createOrganisationAction(data);
    setPending(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const selectedCountry = countries.find((country) => country.id === values.countryId);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <ol className="flex flex-wrap gap-2 text-xs">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              index === step
                ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
                : "rounded-full bg-muted px-3 py-1 text-muted-foreground"
            }
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {submitError ? <Alert variant="destructive">{submitError}</Alert> : null}

      {step === 0 ? (
        <Card className="shadow-none">
          <CardContent className="space-y-4 p-6">
            <Field label="Organisation type" error={form.formState.errors.type?.message}>
              <Select {...form.register("type")}>
                <option value="MANUFACTURER">Manufacturer</option>
                <option value="BRAND_OWNER">Brand owner</option>
                <option value="DISTRIBUTOR">Distributor / importer</option>
                <option value="RETAILER">Retailer</option>
              </Select>
            </Field>
            <Field label="Company name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </Field>
            <Field label="Legal company name" error={form.formState.errors.legalName?.message}>
              <Input {...form.register("legalName")} />
            </Field>
            <Field label="Registration number" error={form.formState.errors.registrationNumber?.message}>
              <Input {...form.register("registrationNumber")} />
            </Field>
            <Field label="VAT / tax number" error={form.formState.errors.vatNumber?.message}>
              <Input {...form.register("vatNumber")} />
            </Field>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="shadow-none">
          <CardContent className="space-y-4 p-6">
            <Field label="Search country" error={form.formState.errors.countryId?.message}>
              <Input
                value={countryQuery}
                onChange={(event) => setCountryQuery(event.target.value)}
                placeholder="Start typing a country name"
              />
            </Field>
            <Field label="Country">
              <Select {...form.register("countryId")}>
                <option value="">Select a country</option>
                {filteredCountries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name} ({country.iso2})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Address" error={form.formState.errors.addressLine1?.message}>
              <Input {...form.register("addressLine1")} />
            </Field>
            <Field label="Address line 2">
              <Input {...form.register("addressLine2")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" error={form.formState.errors.city?.message}>
                <Input {...form.register("city")} />
              </Field>
              <Field label="Region">
                <Input {...form.register("region")} />
              </Field>
              <Field label="Postal code" error={form.formState.errors.postalCode?.message}>
                <Input {...form.register("postalCode")} />
              </Field>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="shadow-none">
          <CardContent className="space-y-4 p-6">
            <Field label="Website" error={form.formState.errors.website?.message}>
              <Input {...form.register("website")} placeholder="https://" />
            </Field>
            <Field label="Business email" error={form.formState.errors.businessEmail?.message}>
              <Input type="email" {...form.register("businessEmail")} />
            </Field>
            <Field label="Contact person" error={form.formState.errors.contactPerson?.message}>
              <Input {...form.register("contactPerson")} />
            </Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} />
            </Field>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="shadow-none">
          <CardContent className="space-y-4 p-6">
            <Field label="GS1 company prefix (optional)" error={form.formState.errors.gs1CompanyPrefix?.message}>
              <Input {...form.register("gs1CompanyPrefix")} placeholder="If issued by GS1" />
            </Field>
            <div className="space-y-2">
              <Label htmlFor="brand-draft">Brands owned</Label>
              <div className="flex gap-2">
                <Input
                  id="brand-draft"
                  value={brandDraft}
                  onChange={(event) => setBrandDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addBrand();
                    }
                  }}
                  placeholder="Add a brand name"
                />
                <Button type="button" variant="secondary" onClick={addBrand}>
                  Add
                </Button>
              </div>
              {form.formState.errors.brands?.message ? (
                <p className="text-xs text-destructive">{form.formState.errors.brands.message}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                    onClick={() =>
                      form.setValue(
                        "brands",
                        brands.filter((item) => item !== brand),
                        { shouldValidate: true },
                      )
                    }
                  >
                    {brand} ×
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="shadow-none">
          <CardContent className="space-y-3 p-6 text-sm">
            <ReviewRow label="Company" value={`${values.name} · ${values.legalName}`} />
            <ReviewRow label="Type" value={values.type} />
            <ReviewRow label="Country" value={selectedCountry?.name ?? "Not selected"} />
            <ReviewRow
              label="Address"
              value={`${values.addressLine1}, ${values.city} ${values.postalCode}`}
            />
            <ReviewRow label="Contact" value={`${values.contactPerson} · ${values.businessEmail}`} />
            <ReviewRow label="Brands" value={values.brands.join(", ") || "None"} />
            <Alert>
              Your organisation will be created with status <strong>Pending verification</strong>.
              A super admin must verify the company before manufacturer-verified badges can be
              published.
            </Alert>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || pending}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => void nextStep()}>
            Continue
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Submit for verification"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2 sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
