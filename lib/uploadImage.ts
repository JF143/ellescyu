import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl) return;

  // Extract the storage filename from the public URL, e.g.
  // https://xxxx.supabase.co/storage/v1/object/public/product-images/<filename>
  const marker = "/product-images/";
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const fileName = imageUrl.slice(index + marker.length);
  if (!fileName) return;

  const { error } = await supabase.storage.from("product-images").remove([fileName]);
  if (error) {
    // Don't throw — a failed cleanup shouldn't block the user's edit from succeeding
    console.error("Failed to delete old product image:", error);
  }
}