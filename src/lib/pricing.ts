import { z } from "zod";

export const productCodeSchema = z.enum([
  "pack_event",
  "pack_club",
  "pack_bulk",
  "plan_campus",
]);

export type ProductCode = z.infer<typeof productCodeSchema>;

export interface ProductConfig {
  code: ProductCode;
  name: string;
  credits: number;
  pricePaise: number; // ex-GST
  isPlan?: boolean;
  durationMonths: number;
}

export const PRODUCTS: Record<ProductCode, ProductConfig> = {
  pack_event: {
    code: "pack_event",
    name: "Event Pack (500 Certificates)",
    credits: 500,
    pricePaise: 99900, // ₹999
    durationMonths: 12,
  },
  pack_club: {
    code: "pack_club",
    name: "Club Pack (2,000 Certificates)",
    credits: 2000,
    pricePaise: 299900, // ₹2,999
    durationMonths: 12,
  },
  pack_bulk: {
    code: "pack_bulk",
    name: "Bulk Pack (5,000 Certificates)",
    credits: 5000,
    pricePaise: 599900, // ₹5,999
    durationMonths: 12,
  },
  plan_campus: {
    code: "plan_campus",
    name: "Campus Annual Plan (10,000 Certificates)",
    credits: 10000,
    pricePaise: 2499900, // ₹24,999
    isPlan: true,
    durationMonths: 12,
  },
};
