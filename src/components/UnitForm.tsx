import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNavigate } from "@tanstack/react-router"
import { type } from "arktype"
import { useMutation } from "convex/react"
import { Loader2, Plus, Trash2, Utensils, Waves, Wifi } from "lucide-react"
import { useState } from "react"
import { api } from "../../convex/_generated/api"
import { CurrencyInput } from "@/components/CurrencyInput"
import type { Doc } from "../../convex/_generated/dataModel"


// Define Schema using Arktype

const unitSchema = type({
    name: "string > 0",
    area: "string > 0",
    distanceFromKoramangala: "string",
    hasFood: "boolean",
    hasLaundry: "boolean",
    hasWifi: "boolean",
    coordinates: {
        address: "string",
        "mapLink?": "string",
        "lat?": "number",
        "lng?": "number"
    },
    rooms: type({
        roomType: "string", // Single, Double Sharing, Triple Sharing
        rent: "number >= 0",
        depositRefundable: "number >= 0",
        depositNonRefundable: "number >= 0",
        hasAttachedBathroom: "boolean",
        hasBalcony: "boolean"
    }).array(),
    contacts: type({
        name: "string",
        designation: "string",
        phone: "string"
    }).array(),
    "notes?": "string"
})

type UnitFormData = typeof unitSchema.infer

interface UnitFormProps {
    initialData?: Doc<"units"> & { gallery?: { url: string | null }[] }
    isEdit?: boolean
}

export function UnitForm({ initialData, isEdit = false }: UnitFormProps) {
    const navigate = useNavigate()
    const createUnit = useMutation(api.units.create)
    const updateUnit = useMutation(api.units.update)
    const deleteUnit = useMutation(api.units.remove)
    const generateUploadUrl = useMutation(api.units.generateUploadUrl)
    
    const [uploading, setUploading] = useState(false)
    // Local gallery state tracks storageId for DB and url for Preview
    const [gallery, setGallery] = useState<{storageId: string, author: string, caption: string, date: string, url?: string | null}[]>(initialData?.gallery || [])

    const form = useForm({
        defaultValues: {
            name: initialData?.name ?? "",
            area: initialData?.area ?? "",
            distanceFromKoramangala: initialData?.distanceFromKoramangala ?? "",
            hasFood: initialData?.hasFood ?? false,
            hasLaundry: initialData?.hasLaundry ?? false,
            hasWifi: initialData?.hasWifi ?? false,
            coordinates: {
                address: initialData?.coordinates.address ?? "",
                mapLink: initialData?.coordinates.mapLink ?? "",
            },
            rooms: initialData?.rooms ?? [],
            contacts: initialData?.contacts ?? [{ name: "", designation: "Caretaker", phone: "" }],
            notes: initialData?.notes ?? ""
        } as UnitFormData,
        onSubmit: async ({ value }) => {
           try {
               const payload = {
                   ...value,
                   // Strip URLs before saving to DB
                   gallery: gallery.map(({ url, ...rest }) => rest)
               }

               if (isEdit && initialData) {
                   await updateUnit({
                       id: initialData._id,
                       ...payload
                   })
               } else {
                   await createUnit(payload)
               }
               
               navigate({ to: "/" })
           } catch (e) {
               console.error(e)
               alert("Failed to save unit: " + (e as Error).message)
           }
        },
    })

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const postUrl = await generateUploadUrl()
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            })
            const { storageId } = await result.json()

            setGallery([...gallery, {
                storageId,
                author: "Admin", 
                caption: file.name,
                date: new Date().toISOString(),
                url: URL.createObjectURL(file) // Local preview
            }])
        } catch (error) {
            console.error("Upload failed", error)
            alert("Upload failed")
        } finally {
            setUploading(false)
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-6 max-w-2xl mx-auto pb-20"
        >
            <Card>
                <CardHeader>
                    <CardTitle>PG Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form.Field
                        name="name"
                        children={(field) => (
                            <div>
                                <Label htmlFor={field.name}>PG Name</Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. Sunrise PG"
                                />
                            </div>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <form.Field
                            name="area"
                            children={(field) => (
                                <div>
                                    <Label htmlFor={field.name}>Area</Label>
                                    <Input
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. Koramangala"
                                    />
                                </div>
                            )}
                        />
                         <form.Field
                            name="distanceFromKoramangala"
                            children={(field) => (
                                <div>
                                    <Label htmlFor={field.name}>Distance from Kora</Label>
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. 1.2km"
                                    />
                                </div>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-3 gap-4">
                        <form.Field
                            name="hasFood"
                            children={(field) => (
                                <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-neutral-50"
                                     onClick={() => field.handleChange(!field.state.value)}
                                >
                                    <Utensils className={`w-6 h-6 mb-2 ${field.state.value ? "text-primary" : "text-neutral-400"}`} />
                                    <span className={`text-sm font-medium ${field.state.value ? "text-primary" : "text-neutral-500"}`}>Food</span>
                                </div>
                            )}
                        />
                        <form.Field
                            name="hasLaundry"
                            children={(field) => (
                                <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-neutral-50"
                                     onClick={() => field.handleChange(!field.state.value)}
                                >
                                    <Waves className={`w-6 h-6 mb-2 ${field.state.value ? "text-blue-500" : "text-neutral-400"}`} />
                                    <span className={`text-sm font-medium ${field.state.value ? "text-blue-600" : "text-neutral-500"}`}>Laundry</span>
                                </div>
                            )}
                        />
                         <form.Field
                            name="hasWifi"
                            children={(field) => (
                                <div className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-neutral-50"
                                     onClick={() => field.handleChange(!field.state.value)}
                                >
                                    <Wifi className={`w-6 h-6 mb-2 ${field.state.value ? "text-green-500" : "text-neutral-400"}`} />
                                    <span className={`text-sm font-medium ${field.state.value ? "text-green-600" : "text-neutral-500"}`}>Wifi</span>
                                </div>
                            )}
                        />
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <form.Field
                        name="coordinates.address"
                        children={(field) => (
                            <div>
                                <Label>Full Address</Label>
                                <Textarea
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}
                    />
                     <form.Field
                        name="coordinates.mapLink"
                        children={(field) => (
                            <div>
                                <Label>Google Maps Link</Label>
                                <Input
                                    value={field.state.value || ""}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Dynamic Rooms */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Rooms</CardTitle>
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => form.pushFieldValue("rooms", { 
                            roomType: "Double Sharing", 
                            rent: 0, 
                            depositRefundable: 0, 
                            depositNonRefundable: 0,
                            hasAttachedBathroom: true,
                            hasBalcony: false
                        })}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Room
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form.Field name="rooms">
                        {(field) => field.state.value.map((_, i) => (
                           <div key={i} className="p-4 border rounded-md relative bg-neutral-50/50">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 text-red-500"
                                    onClick={() => form.removeFieldValue("rooms", i)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                     <form.Field name={`rooms[${i}].roomType`}>
                                        {(subField) => (
                                           <div>
                                             <Label className="text-xs">Type</Label>
                                              <select
                                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                                  value={subField.state.value}
                                                  onChange={(e) => subField.handleChange(e.target.value)}
                                              >
                                                  <option value="Single">Single</option>
                                                  <option value="Double Sharing">Double Sharing</option>
                                                  <option value="Triple Sharing">Triple Sharing</option>
                                                  <option value="Four Sharing">Four Sharing</option>
                                              </select>
                                           </div>
                                        )}
                                     </form.Field>
                                     <form.Field name={`rooms[${i}].rent`}>
                                        {(subField) => (
                                           <div>
                                             <Label className="text-xs">Rent</Label>
                                             <CurrencyInput
                                                value={subField.state.value} 
                                                onChange={(val) => subField.handleChange(val as number)} // Cast because schema expects number, validation will handle undefined
                                             />
                                           </div>
                                        )}
                                     </form.Field>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                     <form.Field name={`rooms[${i}].depositRefundable`}>
                                        {(subField) => (
                                           <div>
                                             <Label className="text-xs">Refundable Dep.</Label>
                                             <CurrencyInput
                                                value={subField.state.value} 
                                                onChange={(val) => subField.handleChange(val as number)} 
                                             />
                                           </div>
                                        )}
                                     </form.Field>
                                     <form.Field name={`rooms[${i}].depositNonRefundable`}>
                                        {(subField) => (
                                            <div>
                                                <Label className="text-xs">Non-Refundable (Opt)</Label>
                                                <CurrencyInput
                                                    value={subField.state.value}
                                                    onChange={(val) => subField.handleChange(val as number)}
                                                />
                                            </div>
                                        )}
                                     </form.Field>
                                </div>

                                <div className="flex gap-4">
                                     <form.Field name={`rooms[${i}].hasAttachedBathroom`}>
                                        {(subField) => (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`bath-${i}`}
                                                    checked={subField.state.value}
                                                    onChange={(e) => subField.handleChange(e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor={`bath-${i}`} className="text-xs font-normal">Attached Bath</Label>
                                            </div>
                                        )}
                                     </form.Field>
                                     <form.Field name={`rooms[${i}].hasBalcony`}>
                                        {(subField) => (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`balc-${i}`}
                                                    checked={subField.state.value}
                                                    onChange={(e) => subField.handleChange(e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor={`balc-${i}`} className="text-xs font-normal">Balcony</Label>
                                            </div>
                                        )}
                                     </form.Field>
                                </div>
                           </div>
                        ))}
                    </form.Field>
                </CardContent>
            </Card>
            
            {/* Gallery Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {gallery.map((img, i) => (
                            <div key={i} className="aspect-square bg-neutral-100 relative rounded overflow-hidden group">
                                {img.url ? (
                                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400 break-all p-2">
                                        {img.caption}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="file" onChange={handleImageUpload} disabled={uploading} accept="image/*" />
                        {uploading && <Loader2 className="animate-spin w-4 h-4" />}
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                {isEdit && (
                    <Button 
                        type="button" 
                        variant="destructive" 
                        className="w-1/3"
                        onClick={async () => {
                            if (confirm("Are you sure you want to delete this unit?")) {
                                if (initialData?._id) {
                                    await deleteUnit({ id: initialData._id })
                                    navigate({ to: "/" })
                                }
                            }
                        }}
                    >
                        Delete
                    </Button>
                )}
                <Button type="submit" className="flex-1" disabled={form.state.isSubmitting}>
                    {form.state.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isEdit ? "Update Unit" : "Create Unit"}
                </Button>
            </div>
        </form>
    )
}
