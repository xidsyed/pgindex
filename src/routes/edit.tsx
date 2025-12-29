import { UnitForm } from "@/components/UnitForm"
import { useParams } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"


export function EditUnitScreen() {
    const { unitId } = useParams({ from: "/edit/$unitId" })
    const unit = useQuery(api.units.getById, { id: unitId as Id<"units"> })

    if (unit === undefined) return <div>Loading...</div>
    if (unit === null) return <div>Unit not found</div>

    return (
        <div className="container mx-auto p-4">
             <h1 className="text-2xl font-bold mb-6 text-center">Edit Unit: {unit.name}</h1>
             <UnitForm initialData={unit} isEdit />
        </div>
    )
}
