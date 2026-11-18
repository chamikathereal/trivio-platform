/**
 * Trivio Developer Console — Domain Models and Fictional Illustrative Data
 * Strictly compliant with Stage 4B boundaries:
 * Fictional merchants, realistic acquirer parameters, zero customer PII.
 */

export interface FeeAgreement {
  id: string;
  name: string;
  version: string;
  status: "ACTIVE" | "DRAFT" | "DEPRECATED";
  percentageBps: number; // Basis points (250 = 2.50%)
  fixedFeeMinor: bigint; // Minor units (1500n = $15.00)
  minFeeMinor?: bigint;  // Optional floor
  maxFeeMinor?: bigint;  // Optional ceiling
  priority: number;
  effectiveFrom: string;
  description: string;
  currency: string;
}

export interface SettlementPolicy {
  id: string;
  name: string;
  version: string;
  status: "ACTIVE" | "DRAFT" | "DEPRECATED";
  cycleDays: number; // e.g. 1 (T+1), 2 (T+2)
  cutOffTimeUtc: string; // "16:00"
  weekendHandling: "following_business_day" | "preceding_business_day" | "no_adjustment";
  holidays: string[];
  timezone: string;
  description: string;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "PENDING_SETUP" | "FLAGGED";
  acquirerId: string;
  acquirerName: string;
  currency: string;
  feeAgreementId: string;
  settlementPolicyId: string;
  monthlyVolumeEstimateMinor: bigint;
  createdAt: string;
  timezone: string;
}

export interface ConfigurationWarning {
  id: string;
  severity: "high" | "medium" | "low";
  merchantId: string;
  merchantName: string;
  title: string;
  message: string;
  recommendation: string;
}

export const INITIAL_FEE_AGREEMENTS: FeeAgreement[] = [
  {
    id: "fee_ent_standard",
    name: "Enterprise Domestic MDR (Tier 1)",
    version: "v2.1",
    status: "ACTIVE",
    percentageBps: 220, // 2.20%
    fixedFeeMinor: 30n, // $0.30
    minFeeMinor: 25n,  // $0.25 floor
    maxFeeMinor: 50000n, // $500.00 cap
    priority: 10,
    effectiveFrom: "2026-01-01",
    description: "Standard domestic corporate acquiring rate with blended card network interchange and acquirer markup.",
    currency: "USD",
  },
  {
    id: "fee_micro_merchant",
    name: "Micro-Merchant Fixed Plus Tier",
    version: "v1.4",
    status: "ACTIVE",
    percentageBps: 290, // 2.90%
    fixedFeeMinor: 15n, // $0.15
    minFeeMinor: 15n,
    priority: 5,
    effectiveFrom: "2026-03-15",
    description: "Optimized for high-frequency low-ticket transactions with reduced fixed acquirer surcharge.",
    currency: "USD",
  },
  {
    id: "fee_intl_crossborder",
    name: "Cross-Border & High Risk Premium",
    version: "v3.0",
    status: "ACTIVE",
    percentageBps: 340, // 3.40%
    fixedFeeMinor: 50n, // $0.50
    minFeeMinor: 100n,
    maxFeeMinor: 100000n,
    priority: 20,
    effectiveFrom: "2026-02-01",
    description: "Multi-currency cross-border acquiring agreement covering FX assessment spreads and scheme assessments.",
    currency: "USD",
  },
  {
    id: "fee_lkr_retail",
    name: "South Asia Regional Clearing (LKR)",
    version: "v1.0",
    status: "ACTIVE",
    percentageBps: 180, // 1.80%
    fixedFeeMinor: 2500n, // LKR 25.00
    priority: 8,
    effectiveFrom: "2026-04-01",
    description: "LankaPay & local acquirer direct settlement schedule for point-of-sale and eCommerce aggregators.",
    currency: "LKR",
  },
  {
    id: "fee_draft_q4",
    name: "Q4 High-Volume Promo Tier",
    version: "v0.9-draft",
    status: "DRAFT",
    percentageBps: 195, // 1.95%
    fixedFeeMinor: 20n, // $0.20
    priority: 1,
    effectiveFrom: "2026-12-01",
    description: "Proposed year-end holiday promotion for merchants processing >$500k monthly volume.",
    currency: "USD",
  },
];

export const INITIAL_SETTLEMENT_POLICIES: SettlementPolicy[] = [
  {
    id: "pol_t_plus_2_us",
    name: "US Federal Reserve T+2 Standard",
    version: "v2.0",
    status: "ACTIVE",
    cycleDays: 2,
    cutOffTimeUtc: "16:00",
    weekendHandling: "following_business_day",
    holidays: [
      "2026-01-01", // New Year's Day
      "2026-01-19", // MLK Day
      "2026-02-16", // Presidents' Day
      "2026-05-25", // Memorial Day
      "2026-06-19", // Juneteenth
      "2026-07-04", // Independence Day
      "2026-09-07", // Labor Day
      "2026-11-26", // Thanksgiving Day
      "2026-12-25", // Christmas Day
    ],
    timezone: "America/New_York",
    description: "Standard clearance cycle for ACH and Fedwire credit batches with 16:00 UTC daily cut-off window.",
  },
  {
    id: "pol_t_plus_1_expedited",
    name: "Expedited T+1 Clearance Window",
    version: "v1.8",
    status: "ACTIVE",
    cycleDays: 1,
    cutOffTimeUtc: "18:00",
    weekendHandling: "following_business_day",
    holidays: [
      "2026-01-01",
      "2026-12-25",
    ],
    timezone: "America/Chicago",
    description: "Next-business-day expedited clearing for qualified prime merchants with early settlement batch submissions.",
  },
  {
    id: "pol_t_plus_3_intl",
    name: "International Nostro T+3 Clearance",
    version: "v1.2",
    status: "ACTIVE",
    cycleDays: 3,
    cutOffTimeUtc: "14:00",
    weekendHandling: "following_business_day",
    holidays: [
      "2026-01-01",
      "2026-04-03", // Good Friday
      "2026-04-06", // Easter Monday
      "2026-12-25",
      "2026-12-26",
    ],
    timezone: "Europe/London",
    description: "Cross-border correspondent banking clearing cycle with extended holiday observation.",
  },
  {
    id: "pol_t_plus_1_lanka",
    name: "Central Bank of Sri Lanka (CBSL) T+1",
    version: "v2.2",
    status: "ACTIVE",
    cycleDays: 1,
    cutOffTimeUtc: "15:00",
    weekendHandling: "following_business_day",
    holidays: [
      "2026-01-02", // Duruthu Poya
      "2026-01-15", // Tamil Thai Pongal Day
      "2026-02-04", // National Day
      "2026-04-13", // Sinhala & Tamil New Year
      "2026-04-14",
      "2026-05-01", // May Day
      "2026-05-02", // Vesak Full Moon Poya
      "2026-12-25", // Christmas Day
    ],
    timezone: "Asia/Colombo",
    description: "Sri Lanka Real-Time Gross Settlement (SL-RTGS) and LankaPay common card switch settlement schedule.",
  },
];

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: "mer_apex_cloud",
    name: "Apex Cloud Services Inc.",
    slug: "apex-cloud",
    status: "ACTIVE",
    acquirerId: "acq_jpmorgan",
    acquirerName: "J.P. Morgan Payments",
    currency: "USD",
    feeAgreementId: "fee_ent_standard",
    settlementPolicyId: "pol_t_plus_2_us",
    monthlyVolumeEstimateMinor: 125000000n, // $1,250,000.00
    createdAt: "2026-01-10",
    timezone: "America/New_York",
  },
  {
    id: "mer_lumina_health",
    name: "Lumina Telehealth Group",
    slug: "lumina-health",
    status: "ACTIVE",
    acquirerId: "acq_stripe_cust",
    acquirerName: "Stripe Custom Connect",
    currency: "USD",
    feeAgreementId: "fee_micro_merchant",
    settlementPolicyId: "pol_t_plus_1_expedited",
    monthlyVolumeEstimateMinor: 48000000n, // $480,000.00
    createdAt: "2026-02-18",
    timezone: "America/Chicago",
  },
  {
    id: "mer_serendib_voyages",
    name: "Serendib Voyages & Resorts",
    slug: "serendib-voyages",
    status: "ACTIVE",
    acquirerId: "acq_commercial_bank",
    acquirerName: "Commercial Bank of Ceylon",
    currency: "LKR",
    feeAgreementId: "fee_lkr_retail",
    settlementPolicyId: "pol_t_plus_1_lanka",
    monthlyVolumeEstimateMinor: 3850000000n, // LKR 38,500,000.00
    createdAt: "2026-03-04",
    timezone: "Asia/Colombo",
  },
  {
    id: "mer_solaris_logistics",
    name: "Solaris Freight & Cross-Border",
    slug: "solaris-logistics",
    status: "ACTIVE",
    acquirerId: "acq_barclays",
    acquirerName: "Barclays Merchant Services",
    currency: "USD",
    feeAgreementId: "fee_intl_crossborder",
    settlementPolicyId: "pol_t_plus_3_intl",
    monthlyVolumeEstimateMinor: 92000000n, // $920,000.00
    createdAt: "2026-03-22",
    timezone: "Europe/London",
  },
  {
    id: "mer_helios_gaming",
    name: "Helios Interactive Studios",
    slug: "helios-gaming",
    status: "PENDING_SETUP",
    acquirerId: "acq_checkout_com",
    acquirerName: "Checkout.com",
    currency: "USD",
    feeAgreementId: "fee_draft_q4",
    settlementPolicyId: "pol_t_plus_2_us",
    monthlyVolumeEstimateMinor: 15000000n, // $150,000.00
    createdAt: "2026-04-05",
    timezone: "America/Los_Angeles",
  },
];

export const INITIAL_WARNINGS: ConfigurationWarning[] = [
  {
    id: "warn_1",
    severity: "medium",
    merchantId: "mer_helios_gaming",
    merchantName: "Helios Interactive Studios",
    title: "Draft Fee Agreement Assigned",
    message: "Assigned fee agreement 'fee_draft_q4' is currently in DRAFT status. Estimates will simulate in sandbox mode only.",
    recommendation: "Promote fee agreement to ACTIVE status prior to production reconciliation.",
  },
  {
    id: "warn_2",
    severity: "low",
    merchantId: "mer_solaris_logistics",
    merchantName: "Solaris Freight & Cross-Border",
    title: "Cut-Off Window Discrepancy",
    message: "Acquirer cut-off at 14:00 UTC observed. Transactions captured between 14:00 and 23:59 UTC incur automatic +1 day calendar shift.",
    recommendation: "Ensure backend microservices ingest settlement estimates using UTC timestamps for cut-off fidelity.",
  },
  {
    id: "warn_3",
    severity: "high",
    merchantId: "mer_serendib_voyages",
    merchantName: "Serendib Voyages & Resorts",
    title: "Upcoming Central Bank Holiday Cluster",
    message: "Sinhala & Tamil New Year (April 13-14) causes a 4-day settlement blackout across local clearing banks.",
    recommendation: "Notify merchant treasury of T+4 extended clearance during the holiday window.",
  },
];
