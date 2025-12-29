import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

import { MapPin } from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { Doc } from "../../convex/_generated/dataModel"


interface UnitCardProps {
  unit: Doc<"units">
}

export function UnitCard({ unit }: UnitCardProps) {
  // Calculate starting rent
  const startingRent = unit.rooms.length > 0 
    ? Math.min(...unit.rooms.map(r => r.rent))
    : 0

  return (
    <Link to="/unit/$unitId" params={{ unitId: unit._id }} className="block h-full"> 
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col">
        {/* Image Placeholder or Cover */}
        <div className="h-48 bg-neutral-200 relative">
            {unit.gallery && unit.gallery.length > 0 ? (
                <img 
                    src={unit.gallery[0].storageId} // TODO: Resolve storage ID to URL
                    alt={unit.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                    No Image
                </div>
            )}
            {/* Unit Type Badge Removed */}
        </div>

        
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg leading-tight line-clamp-1">{unit.name}</h3>
          </div>
          <div className="flex items-center text-sm text-neutral-500 mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="line-clamp-1">{unit.area}</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 flex-grow">
          <div className="text-sm text-neutral-600 space-y-1">
            <p>From Koramangala: {unit.distanceFromKoramangala}</p>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 mt-auto border-t border-neutral-100 bg-neutral-50/50">
           <div className="w-full flex justify-between items-center mt-3">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Starts at</span>
                <span className="text-lg font-bold text-primary">₹{startingRent.toLocaleString()}</span>
           </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
