import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  units: defineTable({
    name: v.string(),
    area: v.string(),
    // unitType removed, implicitly PG
    coordinates: v.object({
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
      address: v.string(),
      mapLink: v.optional(v.string()),
    }),
    rooms: v.array(
      v.object({
        roomType: v.string(), // "Single", "Double Sharing", "Triple Sharing"
        rent: v.number(),
        depositRefundable: v.number(),
        depositNonRefundable: v.number(),
        hasAttachedBathroom: v.boolean(),
        hasBalcony: v.boolean(),
      })
    ),
    contacts: v.array(
      v.object({
        name: v.string(),
        designation: v.string(),
        phone: v.string(),
      })
    ),
    gallery: v.array(
      v.object({
        storageId: v.string(),
        author: v.string(),
        caption: v.string(),
        date: v.string(),
      })
    ),
    distanceFromKoramangala: v.string(),
    hasFood: v.boolean(),
    hasLaundry: v.boolean(),
    hasWifi: v.boolean(),
    notes: v.optional(v.string()),
    
    // For search indexing (Name + Area)
    searchContent: v.string(), 
  }).searchIndex("search_body", {
    searchField: "searchContent",
    filterFields: ["hasFood", "hasLaundry", "hasWifi"], 
  }),
});
