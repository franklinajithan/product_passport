import { z } from "zod";

export const organisationWizardSchema = z.object({
  type: z.enum(["MANUFACTURER", "BRAND_OWNER", "DISTRIBUTOR", "RETAILER"]),
  name: z.string().trim().min(2, "Enter the trading name.").max(160),
  legalName: z.string().trim().min(2, "Enter the legal company name.").max(200),
  registrationNumber: z.string().trim().max(80).optional().or(z.literal("")),
  vatNumber: z.string().trim().max(80).optional().or(z.literal("")),
  countryId: z.string().uuid("Select a country."),
  addressLine1: z.string().trim().min(3, "Enter the street address.").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter the city.").max(120),
  region: z.string().trim().max(120).optional().or(z.literal("")),
  postalCode: z.string().trim().min(2, "Enter the postal code.").max(20),
  website: z
    .string()
    .trim()
    .url("Enter a valid website URL.")
    .optional()
    .or(z.literal("")),
  businessEmail: z.string().trim().toLowerCase().email("Enter a valid business email."),
  contactPerson: z.string().trim().min(2, "Enter a contact person.").max(120),
  phone: z.string().trim().min(6, "Enter a phone number.").max(40),
  gs1CompanyPrefix: z
    .string()
    .trim()
    .regex(/^$|^\d{4,12}$/, "GS1 company prefix must be 4–12 digits.")
    .optional(),
  brands: z
    .array(z.string().trim().min(1).max(120))
    .min(1, "Add at least one brand."),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

export const reviewOrganisationSchema = z.object({
  organisationId: z.string().uuid(),
  decision: z.enum(["VERIFIED", "REJECTED"]),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const suspendEntitySchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().min(3, "Provide a reason.").max(1000),
});

export type OrganisationWizardInput = z.infer<typeof organisationWizardSchema>;
