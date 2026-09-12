-- CreateEnum
CREATE TYPE "IdentifierType" AS ENUM ('GTIN_8', 'GTIN_12', 'GTIN_13', 'GTIN_14', 'UPC_A', 'EAN_8', 'EAN_13', 'ISBN_10', 'ISBN_13', 'PLU', 'SKU', 'MPN', 'INTERNAL', 'GS1_DIGITAL_LINK', 'OTHER');

-- CreateEnum
CREATE TYPE "IdentifierStatus" AS ENUM ('ACTIVE', 'RESERVED', 'RETIRED', 'SUPERSEDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "OwnershipStatus" AS ENUM ('UNVERIFIED', 'FORMAT_VALID', 'OWNER_VERIFIED', 'GS1_VERIFIED', 'DISPUTED', 'RETIRED');

-- CreateEnum
CREATE TYPE "TradePartyRole" AS ENUM ('BRAND_OWNER', 'MANUFACTURER', 'CONTRACT_MANUFACTURER', 'IMPORTER', 'DISTRIBUTOR', 'RETAILER', 'DATA_PROVIDER');

-- CreateEnum
CREATE TYPE "PackagingLevel" AS ENUM ('CONSUMER_UNIT', 'INNER_PACK', 'CASE', 'TRAY', 'DISPLAY', 'PALLET', 'LOGISTIC_UNIT');

-- CreateEnum
CREATE TYPE "BarcodeSymbology" AS ENUM ('EAN_8', 'EAN_13', 'UPC_A', 'UPC_E', 'ITF_14', 'GS1_128', 'GS1_DATABAR', 'GS1_DATAMATRIX', 'GS1_QR_CODE', 'QR_CODE', 'DATA_MATRIX');

-- CreateEnum
CREATE TYPE "GtinDecision" AS ENUM ('SAME_GTIN', 'NEW_GTIN_REQUIRED', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "IdentifierClaimType" AS ENUM ('CLAIM_GTIN', 'CLAIM_BRAND', 'CLAIM_PRODUCT', 'REPORT_MISASSIGNMENT', 'REPORT_COUNTERFEIT', 'REPORT_DUPLICATE');

-- CreateEnum
CREATE TYPE "DataAuthority" AS ENUM ('VERIFIED_BRAND_OWNER', 'AUTHORISED_MANUFACTURER', 'AUTHORISED_DISTRIBUTOR', 'RETAILER', 'TRUSTED_EXTERNAL', 'COMMUNITY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductStatus" ADD VALUE 'PENDING_VERIFICATION';
ALTER TYPE "ProductStatus" ADD VALUE 'WITHDRAWN';
ALTER TYPE "ProductStatus" ADD VALUE 'SUPERSEDED';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "predecessorId" TEXT;

-- AlterTable
ALTER TABLE "ProductMeasurement" ADD COLUMN     "isVariableMeasure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "netContentUnitCode" TEXT,
ADD COLUMN     "pricePerUnit" DECIMAL(12,4);

-- AlterTable
ALTER TABLE "ProductTranslation" ADD COLUMN     "allergenStatement" TEXT,
ADD COLUMN     "isOriginalLanguage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingDescription" TEXT,
ADD COLUMN     "translationSource" TEXT NOT NULL DEFAULT 'MANUFACTURER';

-- CreateTable
CREATE TABLE "Gs1CompanyPrefix" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "countryId" TEXT,
    "issuingMemberOrganisation" TEXT,
    "status" "OwnershipStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verifiedAt" TIMESTAMP(3),
    "source" TEXT,
    "allocationCapacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gs1CompanyPrefix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductIdentifier" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "organisationId" TEXT,
    "identifierType" "IdentifierType" NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "canonicalGtin14" TEXT,
    "displayValue" TEXT NOT NULL,
    "issuingSystem" TEXT NOT NULL,
    "issuingOrganisation" TEXT,
    "status" "IdentifierStatus" NOT NULL DEFAULT 'ACTIVE',
    "checkDigitValid" BOOLEAN NOT NULL DEFAULT false,
    "ownershipStatus" "OwnershipStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationSource" TEXT,
    "gs1CompanyPrefixId" TEXT,
    "standardKey" TEXT,
    "standardVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "ProductIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarcodeSymbol" (
    "id" TEXT NOT NULL,
    "productIdentifierId" TEXT NOT NULL,
    "symbology" "BarcodeSymbology" NOT NULL,
    "encodedData" TEXT NOT NULL,
    "humanReadableText" TEXT NOT NULL,
    "magnification" DOUBLE PRECISION,
    "xDimension" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "quietZone" DOUBLE PRECISION,
    "format" TEXT NOT NULL,
    "svg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarcodeSymbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarcodeQualityCheck" (
    "id" TEXT NOT NULL,
    "identifierId" TEXT NOT NULL,
    "symbolId" TEXT,
    "standard" TEXT NOT NULL DEFAULT 'ISO/IEC 15416',
    "overallGrade" TEXT,
    "contrast" DOUBLE PRECISION,
    "modulation" DOUBLE PRECISION,
    "decodability" DOUBLE PRECISION,
    "defects" DOUBLE PRECISION,
    "quietZones" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarcodeQualityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalLink" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "identifierId" TEXT,
    "domain" TEXT NOT NULL,
    "primaryIdentifier" TEXT NOT NULL,
    "qualifiers" JSONB,
    "attributes" JSONB,
    "uri" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingHierarchy" (
    "id" TEXT NOT NULL,
    "parentProductId" TEXT NOT NULL,
    "childProductId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "packagingLevel" "PackagingLevel" NOT NULL,
    "parentGtin" TEXT,
    "childGtin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackagingHierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductParty" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "organisationId" TEXT,
    "role" "TradePartyRole" NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRevision" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "changeReason" TEXT,
    "gtinDecision" "GtinDecision",
    "snapshot" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInstance" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "gtin" TEXT,
    "lot" TEXT,
    "serial" TEXT,
    "productionDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "bestBeforeDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Standard" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Standard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardVersion" (
    "id" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "publishedDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "StandardVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardRule" (
    "id" TEXT NOT NULL,
    "standardVersionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "StandardRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gs1ApplicationIdentifier" (
    "id" TEXT NOT NULL,
    "ai" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "minLength" INTEGER NOT NULL,
    "maxLength" INTEGER NOT NULL,
    "fixedLength" BOOLEAN NOT NULL,
    "decimalIndicator" BOOLEAN NOT NULL,

    CONSTRAINT "Gs1ApplicationIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayUnit" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantityType" TEXT NOT NULL,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentifierClaim" (
    "id" TEXT NOT NULL,
    "type" "IdentifierClaimType" NOT NULL,
    "identifierId" TEXT,
    "productId" TEXT,
    "organisationId" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "evidenceNote" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentifierClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldProvenance" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceOrganisation" TEXT,
    "sourceUrl" TEXT,
    "authority" "DataAuthority" NOT NULL DEFAULT 'COMMUNITY',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldProvenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gs1CompanyPrefix_organisationId_idx" ON "Gs1CompanyPrefix"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Gs1CompanyPrefix_prefix_key" ON "Gs1CompanyPrefix"("prefix");

-- CreateIndex
CREATE INDEX "ProductIdentifier_productId_idx" ON "ProductIdentifier"("productId");

-- CreateIndex
CREATE INDEX "ProductIdentifier_organisationId_idx" ON "ProductIdentifier"("organisationId");

-- CreateIndex
CREATE INDEX "ProductIdentifier_identifierType_status_idx" ON "ProductIdentifier"("identifierType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductIdentifier_issuingSystem_identifierValue_key" ON "ProductIdentifier"("issuingSystem", "identifierValue");

-- CreateIndex
CREATE UNIQUE INDEX "ProductIdentifier_canonicalGtin14_key" ON "ProductIdentifier"("canonicalGtin14");

-- CreateIndex
CREATE INDEX "BarcodeSymbol_productIdentifierId_idx" ON "BarcodeSymbol"("productIdentifierId");

-- CreateIndex
CREATE INDEX "DigitalLink_productId_idx" ON "DigitalLink"("productId");

-- CreateIndex
CREATE INDEX "DigitalLink_uri_idx" ON "DigitalLink"("uri");

-- CreateIndex
CREATE INDEX "PackagingHierarchy_parentProductId_idx" ON "PackagingHierarchy"("parentProductId");

-- CreateIndex
CREATE INDEX "PackagingHierarchy_childProductId_idx" ON "PackagingHierarchy"("childProductId");

-- CreateIndex
CREATE INDEX "ProductParty_productId_role_idx" ON "ProductParty"("productId", "role");

-- CreateIndex
CREATE INDEX "ProductRevision_productId_effectiveFrom_idx" ON "ProductRevision"("productId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRevision_productId_version_key" ON "ProductRevision"("productId", "version");

-- CreateIndex
CREATE INDEX "ProductInstance_productId_lot_idx" ON "ProductInstance"("productId", "lot");

-- CreateIndex
CREATE UNIQUE INDEX "Standard_key_key" ON "Standard"("key");

-- CreateIndex
CREATE UNIQUE INDEX "StandardVersion_standardId_version_key" ON "StandardVersion"("standardId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "StandardRule_standardVersionId_key_key" ON "StandardRule"("standardVersionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Gs1ApplicationIdentifier_ai_key" ON "Gs1ApplicationIdentifier"("ai");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_code_key" ON "UnitOfMeasure"("code");

-- CreateIndex
CREATE INDEX "IdentifierClaim_status_type_idx" ON "IdentifierClaim"("status", "type");

-- CreateIndex
CREATE INDEX "IdentifierClaim_productId_idx" ON "IdentifierClaim"("productId");

-- CreateIndex
CREATE INDEX "IdentifierClaim_identifierId_idx" ON "IdentifierClaim"("identifierId");

-- CreateIndex
CREATE INDEX "FieldProvenance_entityType_entityId_fieldName_idx" ON "FieldProvenance"("entityType", "entityId", "fieldName");

-- CreateIndex
CREATE INDEX "FieldProvenance_productId_idx" ON "FieldProvenance"("productId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gs1CompanyPrefix" ADD CONSTRAINT "Gs1CompanyPrefix_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gs1CompanyPrefix" ADD CONSTRAINT "Gs1CompanyPrefix_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIdentifier" ADD CONSTRAINT "ProductIdentifier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIdentifier" ADD CONSTRAINT "ProductIdentifier_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIdentifier" ADD CONSTRAINT "ProductIdentifier_gs1CompanyPrefixId_fkey" FOREIGN KEY ("gs1CompanyPrefixId") REFERENCES "Gs1CompanyPrefix"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeSymbol" ADD CONSTRAINT "BarcodeSymbol_productIdentifierId_fkey" FOREIGN KEY ("productIdentifierId") REFERENCES "ProductIdentifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeQualityCheck" ADD CONSTRAINT "BarcodeQualityCheck_identifierId_fkey" FOREIGN KEY ("identifierId") REFERENCES "ProductIdentifier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarcodeQualityCheck" ADD CONSTRAINT "BarcodeQualityCheck_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "BarcodeSymbol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLink" ADD CONSTRAINT "DigitalLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalLink" ADD CONSTRAINT "DigitalLink_identifierId_fkey" FOREIGN KEY ("identifierId") REFERENCES "ProductIdentifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingHierarchy" ADD CONSTRAINT "PackagingHierarchy_parentProductId_fkey" FOREIGN KEY ("parentProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingHierarchy" ADD CONSTRAINT "PackagingHierarchy_childProductId_fkey" FOREIGN KEY ("childProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductParty" ADD CONSTRAINT "ProductParty_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductParty" ADD CONSTRAINT "ProductParty_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRevision" ADD CONSTRAINT "ProductRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductInstance" ADD CONSTRAINT "ProductInstance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardVersion" ADD CONSTRAINT "StandardVersion_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardRule" ADD CONSTRAINT "StandardRule_standardVersionId_fkey" FOREIGN KEY ("standardVersionId") REFERENCES "StandardVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentifierClaim" ADD CONSTRAINT "IdentifierClaim_identifierId_fkey" FOREIGN KEY ("identifierId") REFERENCES "ProductIdentifier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentifierClaim" ADD CONSTRAINT "IdentifierClaim_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentifierClaim" ADD CONSTRAINT "IdentifierClaim_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentifierClaim" ADD CONSTRAINT "IdentifierClaim_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldProvenance" ADD CONSTRAINT "FieldProvenance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
