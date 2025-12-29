import { useParams } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Edit } from "lucide-react"
import { Link } from "@tanstack/react-router"

export function UnitDetailsScreen() {
  const { unitId } = useParams({ from: "/unit/$unitId" })
  const unit = useQuery(api.units.getById, { id: unitId as Id<"units"> })

  if (unit === undefined) {
      return <div className="p-10 text-center">Loading details...</div>
  }

  if (unit === null) {
      return <div className="p-10 text-center">Unit not found</div>
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 min-h-screen pb-20">
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-neutral-500">{unit.area}</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{unit.name}</h1>
                <div className="flex items-center text-neutral-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{unit.coordinates.address}</span>
                </div>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" asChild>
                    <a href={unit.coordinates.mapLink || "#"} target="_blank" rel="noreferrer">
                        Map
                    </a>
                 </Button>
                 <Button variant="ghost" size="sm" asChild>
                    <Link to="/edit/$unitId" params={{ unitId: unit._id }}>
                        <Edit className="w-4 h-4" />
                    </Link>
                 </Button>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (Financials & Gallery) */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Gallery */}
            <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden relative">
                {unit.gallery && unit.gallery.length > 0 ? (
                    <img 
                        src={unit.gallery[0].storageId} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-neutral-400">No images</div>
                )}
            </div>

            {/* Financials */}
            <Card>
                <CardHeader>
                    <CardTitle>Room Types & Financials</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-50 text-neutral-500 font-medium">
                                <tr>
                                    <th className="p-3 pl-4">Type</th>
                                    <th className="p-3">Rent</th>
                                    <th className="p-3">Dep (Ref)</th>
                                    <th className="p-3 pr-4">Dep (Non-Ref)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {unit.rooms.map((room, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 pl-4 font-medium">{room.roomType}</td>
                                        <td className="p-3">₹{room.rent.toLocaleString()}</td>
                                        <td className="p-3">₹{room.depositRefundable.toLocaleString()}</td>
                                        <td className="p-3 pr-4">₹{room.depositNonRefundable.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            {unit.notes && (
                <div className="bg-neutral-50 p-4 rounded-md border text-sm text-neutral-700">
                    <h4 className="font-semibold mb-2 text-neutral-900">Notes</h4>
                    <p className="whitespace-pre-wrap">{unit.notes}</p>
                </div>
            )}
        </div>

        {/* Sidebar (Contacts & Info) */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {unit.contacts.map((contact, idx) => (
                        <div key={idx} className="flex justify-between items-center group">
                            <div>
                                <p className="font-medium">{contact.name}</p>
                                <p className="text-xs text-neutral-500">{contact.designation}</p>
                            </div>
                            <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                                <a href={`tel:${contact.phone}`}>
                                    <Phone className="w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    ))}
                    {unit.contacts.length === 0 && <p className="text-neutral-500 text-sm">No contacts listed</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle>Amenities & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500">Distance from Kora</span>
                        <span className="font-medium">{unit.distanceFromKoramangala}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500">Food Available</span>
                        <span className="font-medium">{unit.hasFood ? "Yes" : "No"}</span>
                    </div>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  )
}
