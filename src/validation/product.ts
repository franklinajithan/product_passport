import { z } from "zod";
import { validateGTIN } from "@/lib/standards/gs1/gtin";

const optionalNumber = z.union([
  z.literal(""),
  z.coerce.number().positive().max(1_000_000),
]).optional();

const optionalGtin = z
  .string()
  .trim()
  .max(32)
  .optional()
  .or(z.literal(""))
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }
    const parsed = validateGTIN(value);
    if (!parsed.valid) {
      ctx.addIssue({
        code: "custom",
        message: parsed.issues[0]?.message ?? "Enter a valid GTIN allocated by the brand owner.",
      });
    }
  });

export const productCreateSchema = z.object({
  brandId: z.string().uuid("Select a brand."),
  manufacturerId: z.string().uuid("Select a manufacturer."),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  originCountryId: z.string().uuid().optional().or(z.literal("")),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  originalLanguageCode: z.string().trim().min(2).max(8),
  originalName: z.string().trim().min(2, "Enter the original-language product name.").max(200),
  englishName: z.string().trim().max(200).optional().or(z.literal("")),
  ingredients: z.string().trim().max(4000).optional().or(z.literal("")),
  gtin: optionalGtin,
  netContentValue: optionalNumber,
  netContentUnit: z.enum(["G", "KG", "ML", "L", "OZ", "LB", "PIECES"]).optional(),
  variantOfProductId: z.string().uuid().optional().or(z.literal("")),
  variantLabel: z.string().trim().max(80).optional().or(z.literal("")),
});

export const productUpdateSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().trim().max(80).optional().or(z.literal("")),
  originalName: z.string().trim().min(2).max(200),
  originalLanguageCode: z.string().trim().min(2).max(8),
  englishName: z.string().trim().max(200).optional().or(z.literal("")),
  ingredients: z.string().trim().max(4000).optional().or(z.literal("")),
  netContentValue: optionalNumber,
  netContentUnit: z.enum(["G", "KG", "ML", "L", "OZ", "LB", "PIECES"]).optional(),
  createSuccessor: z.boolean().optional(),
});

export const productIdSchema = z.object({
  productId: z.string().uuid(),
});

export const productRetireSchema = z.object({
  productId: z.string().uuid(),
  reason: z.string().trim().min(3, "Provide a retirement reason.").max(1000),
});

export const productVariantSchema = z.object({
  productId: z.string().uuid(),
  variantLabel: z.string().trim().min(2, "Name the variant.").max(80),
  gtin: optionalGtin,
});

export const packagingLinkSchema = z.object({
  parentProductId: z.string().uuid("Select the outer pack."),
  childProductId: z.string().uuid("Select the contained item."),
  quantity: z.coerce.number().int().min(1).max(100_000),
  parentLevel: z.enum(["INNER_PACK", "CASE", "TRAY", "DISPLAY", "PALLET", "LOGISTIC_UNIT"]),
  childLevel: z.enum(["CONSUMER_UNIT", "INNER_PACK", "CASE", "TRAY", "DISPLAY", "PALLET"]),
});

export const translationUpsertSchema = z.object({
  productId: z.string().uuid(),
  languageCode: z.string().trim().min(2).max(8),
  productName: z.string().trim().min(1).max(200),
  ingredients: z.string().trim().max(4000).optional().or(z.literal("")),
  translationSource: z.enum(["MANUFACTURER", "HUMAN_VERIFIED", "MACHINE"]),
  isOriginalLanguage: z.boolean().optional(),
});

export const identifierRetireSchema = z.object({
  identifierId: z.string().uuid(),
  reason: z.string().trim().min(3).max(1000),
});

export const publishProductSchema = z.object({
  productId: z.string().uuid(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type PackagingLinkInput = z.infer<typeof packagingLinkSchema>;
export type TranslationUpsertInput = z.infer<typeof translationUpsertSchema>;
