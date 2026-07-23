import type { KioskData } from "@/types";

export const seedData: KioskData = {
  sections: [
    { id: "kape", name: "Kape", icon: "☕" },
    { id: "delata", name: "Delata", icon: "🥫" },
  ],
  products: [
    { id: "nescafe-creamy-white", section_id: "kape", name: "Nescafe Creamy White" },
    { id: "koriko-brown", section_id: "kape", name: "Koriko Brown" },
    { id: "milo", section_id: "kape", name: "Milo" },
    { id: "nescafe-stick", section_id: "kape", name: "Nescafe Stick" },
    { id: "555-tuna-adobo", section_id: "delata", name: "555 Tuna Adobo" },
    { id: "century-tuna", section_id: "delata", name: "Century Tuna" },
    { id: "mega-sardines-red", section_id: "delata", name: "Mega Sardines Red" },
  ],
  variants: [
    { id: "ncw-single", product_id: "nescafe-creamy-white", label: "Single", price: 10 },
    { id: "ncw-twin", product_id: "nescafe-creamy-white", label: "Twin", price: 17 },
    { id: "kb-single", product_id: "koriko-brown", label: "Single", price: 10 },
    { id: "kb-twin", product_id: "koriko-brown", label: "Twin", price: 17 },
    { id: "milo-single", product_id: "milo", label: "Single", price: 10 },
    { id: "milo-twin", product_id: "milo", label: "Twin", price: 19 },
    { id: "ns-single", product_id: "nescafe-stick", label: "Single", price: 5 },
    { id: "555-small", product_id: "555-tuna-adobo", label: "Small", price: 35 },
    { id: "ct-85g", product_id: "century-tuna", label: "85g", price: 30 },
    { id: "ct-155g", product_id: "century-tuna", label: "155g", price: 40 },
    { id: "ct-180g", product_id: "century-tuna", label: "180g", price: 50 },
    { id: "msr-big", product_id: "mega-sardines-red", label: "Big", price: 65 },
    { id: "msr-small", product_id: "mega-sardines-red", label: "Small", price: 28 },
  ],
};