import type { KioskData } from "@/types";

export const seedData: KioskData = {
  sections: [
    { id: "kape", name: "Kape", icon: "☕" },
    { id: "delata", name: "Delata", icon: "🥫" },
  ],
  products: [
    { id: "nescafe-creamy-white", sectionId: "kape", name: "Nescafe Creamy White" },
    { id: "koriko-brown", sectionId: "kape", name: "Koriko Brown" },
    { id: "milo", sectionId: "kape", name: "Milo" },
    { id: "nescafe-stick", sectionId: "kape", name: "Nescafe Stick" },
    { id: "555-tuna-adobo", sectionId: "delata", name: "555 Tuna Adobo" },
    { id: "century-tuna", sectionId: "delata", name: "Century Tuna" },
    { id: "mega-sardines-red", sectionId: "delata", name: "Mega Sardines Red" },
  ],
  variants: [
    { id: "ncw-single", productId: "nescafe-creamy-white", label: "Single", price: 10 },
    { id: "ncw-twin", productId: "nescafe-creamy-white", label: "Twin", price: 17 },
    { id: "kb-single", productId: "koriko-brown", label: "Single", price: 10 },
    { id: "kb-twin", productId: "koriko-brown", label: "Twin", price: 17 },
    { id: "milo-single", productId: "milo", label: "Single", price: 10 },
    { id: "milo-twin", productId: "milo", label: "Twin", price: 19 },
    { id: "ns-single", productId: "nescafe-stick", label: "Single", price: 5 },
    { id: "555-small", productId: "555-tuna-adobo", label: "Small", price: 35 },
    { id: "ct-85g", productId: "century-tuna", label: "85g", price: 30 },
    { id: "ct-155g", productId: "century-tuna", label: "155g", price: 40 },
    { id: "ct-180g", productId: "century-tuna", label: "180g", price: 50 },
    { id: "msr-big", productId: "mega-sardines-red", label: "Big", price: 65 },
    { id: "msr-small", productId: "mega-sardines-red", label: "Small", price: 28 },
  ],
};
