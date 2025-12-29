import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    unitType: v.optional(v.string()),
    minRent: v.optional(v.number()),
    maxRent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let units;

    if (args.search) {
      units = await ctx.db
        .query("units")
        .withSearchIndex("search_body", (q) => {
          const search = q.search("searchContent", args.search!);
          if (args.unitType) {
            return search.eq("unitType", args.unitType);
          }
          return search;
        })
        .collect();
        
        // Manual filter for unitType if provided (and not handled by index effectively due to complexity)
        if (args.unitType) {
            units = units.filter(u => u.unitType === args.unitType);
        }

    } else {
      let q = ctx.db.query("units");
      if (args.unitType) {
        q = q.filter((q) => q.eq(q.field("unitType"), args.unitType));
      }
      units = await q.collect();
    }

    // Filter by Rent (min/max)
    // "Starting Rent" is the lowest rent in the rooms array.
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
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    area: v.string(),
    unitType: v.string(),
    coordinates: v.object({
      lat: v.optional(v.number()),
      lng: v.optional(v.number()),
      address: v.string(),
      mapLink: v.optional(v.string()),
    }),
    rooms: v.array(
      v.object({
        roomType: v.string(),
        rent: v.number(),
        depositRefundable: v.number(),
        depositNonRefundable: v.number(),
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const searchContent = `${args.name} ${args.area}`; // Basic search content generation
    return await ctx.db.insert("units", { ...args, searchContent });
  },
});

export const update = mutation({
  args: {
    id: v.id("units"),
    // Partial updates setup
    name: v.optional(v.string()),
    area: v.optional(v.string()),
    unitType: v.optional(v.string()),
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
