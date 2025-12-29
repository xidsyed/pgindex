import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    minRent: v.optional(v.number()),
    maxRent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let units;

    if (args.search) {
      units = await ctx.db
        .query("units")
        .withSearchIndex("search_body", (q) => q.search("searchContent", args.search!))
        .collect();
    } else {
      units = await ctx.db.query("units").collect();
    }

    // Filter by Rent (min/max)
    if (args.minRent !== undefined || args.maxRent !== undefined) {
      units = units.filter((unit) => {
        if (!unit.rooms || unit.rooms.length === 0) return false;
        const minUnitRent = Math.min(...unit.rooms.map((r) => r.rent));
        
        if (args.minRent !== undefined && minUnitRent < args.minRent) return false;
        if (args.maxRent !== undefined && minUnitRent > args.maxRent) return false;
        return true;
      });
    }

    return units;
  },
});

export const getById = query({
  args: { id: v.id("units") },
  handler: async (ctx, args) => {
    const unit = await ctx.db.get(args.id);
    if (!unit) return null;
    
    // Resolve gallery URLs
    const galleryWithUrls = await Promise.all(
        (unit.gallery || []).map(async (img) => ({
            ...img,
            url: await ctx.storage.getUrl(img.storageId)
        }))
    );
    
    return { ...unit, gallery: galleryWithUrls };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    area: v.string(),
    coordinates: v.object({
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
      address: v.string(),
      mapLink: v.optional(v.string()), // Google Maps Link
    }),
    rooms: v.array(
      v.object({
        roomType: v.string(),
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
  },
  handler: async (ctx, args) => {
    const searchContent = `${args.name} ${args.area}`; 
    return await ctx.db.insert("units", { ...args, searchContent });
  },
});

export const update = mutation({
  args: {
    id: v.id("units"),
    name: v.optional(v.string()),
    area: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
      address: v.string(),
      mapLink: v.optional(v.string()),
    })),
    rooms: v.optional(v.array(
      v.object({
        roomType: v.string(),
        rent: v.number(),
        depositRefundable: v.number(),
        depositNonRefundable: v.number(),
        hasAttachedBathroom: v.boolean(),
        hasBalcony: v.boolean(),
      })
    )),
    contacts: v.optional(v.array(
      v.object({
        name: v.string(),
        designation: v.string(),
        phone: v.string(),
      })
    )),
    gallery: v.optional(v.array(
      v.object({
        storageId: v.string(),
        author: v.string(),
        caption: v.string(),
        date: v.string(),
      })
    )),
    distanceFromKoramangala: v.optional(v.string()),
    hasFood: v.optional(v.boolean()),
    hasLaundry: v.optional(v.boolean()),
    hasWifi: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    
    // Fetch current to update searchContent if name/area changes
    const current = await ctx.db.get(id);
    if (!current) throw new Error("Unit not found");

    const newName = fields.name ?? current.name;
    const newArea = fields.area ?? current.area;
    const searchContent = `${newName} ${newArea}`;

    return await ctx.db.patch(id, { ...fields, searchContent });
  },
});

export const remove = mutation({
  args: { id: v.id("units") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
