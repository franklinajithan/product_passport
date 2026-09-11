import type {
  OrganisationStatus,
  OrganisationType,
  ProductStatus,
  VerificationLevel,
} from "@prisma/client";

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type PublicProductCard = {
  gtin: string | null;
  gprId: string;
  name: string;
  englishName: string | null;
  brandName: string;
  manufacturerName: string;
  originCountry: string | null;
  netContent: string | null;
  verification: VerificationLevel;
  status: ProductStatus;
  imageUrl: string | null;
};

export type OrganisationRecord = {
  id: string;
  name: string;
  legalName: string;
  status: OrganisationStatus;
  type: OrganisationType;
};
