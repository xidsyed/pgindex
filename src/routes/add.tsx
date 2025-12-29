import { UnitForm } from "@/components/UnitForm"

export function AddUnitScreen() {
    return (
        <div className="container mx-auto p-4">
             <h1 className="text-2xl font-bold mb-6 text-center">Add New Unit</h1>
             <UnitForm />
        </div>
    )
}
