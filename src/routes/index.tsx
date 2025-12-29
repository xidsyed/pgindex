import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { UnitCard } from "@/components/UnitCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"


import { Link } from "@tanstack/react-router"

export function HomeScreen() {
  const [search, setSearch] = useState("")
  
  // Debounce search could be added here
  const units = useQuery(api.units.list, { 
    search: search || undefined,
  })

  return (
    <div className="container mx-auto max-w-5xl p-4 min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold tracking-tight">PG Index</h1>
          <Link to="/add">
            <Button size="sm" variant="outline">Add Unit</Button>
          </Link>
        </div>

        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input 
                    placeholder="Search by name, area..." 
                    className="pl-9 bg-neutral-100/50 border-neutral-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </header>

      {/* Content */}
      <main className="mt-6">
        {units === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-neutral-100 animate-pulse rounded-lg" />
                ))}
            </div>
        ) : units.length === 0 ? (
            <div className="text-center py-20 text-neutral-500">
                <p>No units found matching your criteria.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map(unit => (
                    <UnitCard key={unit._id} unit={unit} />
                ))}
            </div>
        )}
      </main>
    </div>
  )
}
