"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  List,
  Upload,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Image as ImageIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { categorySchema } from "@/lib/validations"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/components/ui/toast"

interface CategoryItem extends Category {
  productCount: number
  subcategoryCount: number
  isActive: boolean
  image?: string
  children?: CategoryItem[]
  subcategories?: CategoryItem[]
}

interface CategoryFormData {
  name: string
  description: string
  parentId: string
  image: string
  seoTitle: string
  seoDescription: string
  isActive: boolean
}

interface DeleteCategoryResult {
  movedProducts: number
  reparentedSubcategories: number
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      description: "",
      parentId: "",
      image: "",
      seoTitle: "",
      seoDescription: "",
      isActive: true,
    },
  })

  const { data: categories = [], isLoading } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<any>("/categories?limit=100")
      const cats = res.data?.categories || (Array.isArray(res.data) ? res.data : [])
      return cats.map((c: any) => ({
        ...c,
        productCount: c._count?.products || 0,
        subcategoryCount: c.children?.length || 0,
        children: c.children || [],
        subcategories: c.children || [],
      }))
    },
  })

  const saveMutation = useMutation({
    mutationFn: async ({ id, data, file }: { id?: string; data: CategoryFormData; file: File | null }) => {
      // Always use FormData/multipart so backend multer path is always used
      const formData = new FormData()
      formData.append("name", data.name)
      if (data.description) formData.append("description", data.description)
      if (data.parentId) formData.append("parentId", data.parentId)
      if (data.seoTitle) formData.append("seoTitle", data.seoTitle)
      if (data.seoDescription) formData.append("seoDescription", data.seoDescription)
      formData.append("isActive", String(data.isActive))
      if (file) {
        formData.append("image", file)
      }

      if (id) {
        const res = await api.upload<any>(`/categories/${id}`, formData, "PUT")
        return res.data
      } else {
        const res = await api.upload<any>("/categories", formData, "POST")
        return res.data
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsDialogOpen(false)
      setEditingCategory(null)
      setSelectedFile(null)
      setImagePreview(null)
      reset()
      toast("success", variables.id ? "Category updated successfully" : "Category created successfully")
    },
    onError: (error: Error) => {
      console.error("[saveMutation] error:", error)
      toast("error", error.message || "Failed to save category")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ data: DeleteCategoryResult }>(`/categories/${id}`)
      return res.data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsDeleteDialogOpen(false)
      setDeletingCategory(null)
      const movedProducts = result?.movedProducts || 0
      const reparentedSubcategories = result?.reparentedSubcategories || 0
      const details = [
        movedProducts > 0 && `${movedProducts} product${movedProducts === 1 ? "" : "s"} moved to Uncategorized`,
        reparentedSubcategories > 0 && `${reparentedSubcategories} subcategor${reparentedSubcategories === 1 ? "y" : "ies"} retained`,
      ].filter(Boolean)
      toast("success", details.length ? `Category deleted. ${details.join("; ")}.` : "Category deleted successfully")
    },
    onError: (error: Error) => {
      toast("error", error.message || "Failed to delete category")
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.put(`/categories/${id}`, { isActive })
      return { id, isActive }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast("success", "Category status updated")
    },
    onError: (error: Error) => {
      toast("error", error.message || "Failed to update status")
    },
  })

  const moveMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const idx = categories.findIndex((c) => c.id === id)
      if (direction === "up" && idx > 0) {
        const current = categories[idx]
        const swap = categories[idx - 1]
        await Promise.all([
          api.put(`/categories/${current.id}`, { sortOrder: swap.sortOrder }),
          api.put(`/categories/${swap.id}`, { sortOrder: current.sortOrder }),
        ])
      } else if (direction === "down" && idx < categories.length - 1) {
        const current = categories[idx]
        const swap = categories[idx + 1]
        await Promise.all([
          api.put(`/categories/${current.id}`, { sortOrder: swap.sortOrder }),
          api.put(`/categories/${swap.id}`, { sortOrder: current.sortOrder }),
        ])
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast("error", "Image file size should be less than 10MB")
        return
      }
      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category)
    setSelectedFile(null)
    setImagePreview(category.image || null)
    setValue("name", category.name)
    setValue("description", category.description || "")
    setValue("parentId", category.parentId || "")
    setValue("image", category.image || "")
    setValue("seoTitle", category.seoTitle || category.name)
    setValue("seoDescription", category.seoDescription || category.description || "")
    setValue("isActive", category.isActive)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setSelectedFile(null)
    setImagePreview(null)
    reset({
      name: "",
      description: "",
      parentId: "",
      image: "",
      seoTitle: "",
      seoDescription: "",
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: CategoryFormData) => {
    saveMutation.mutate({
      id: editingCategory?.id,
      data,
      file: selectedFile,
    })
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const parentCategories = categories.filter((cat) => !cat.parentId && cat.id !== editingCategory?.id)

  const getDisplayCategories = (cats: CategoryItem[]): CategoryItem[] => {
    return cats.map((cat) => ({
      ...cat,
      children: expandedIds.includes(cat.id) ? cat.children : undefined,
    }))
  }

  const moveCategory = (categoryId: string, direction: "up" | "down") => {
    moveMutation.mutate({ id: categoryId, direction })
  }

  const isDeletingUncategorized = deletingCategory?.slug === "uncategorized"
  const isDeleteBlocked = Boolean(isDeletingUncategorized && deletingCategory?.productCount)
  const deletingCategoryLabel = isDeletingUncategorized ? "Uncategorized" : deletingCategory?.name

  const renderCategoryCard = (category: CategoryItem, isChild = false) => {
    const isExpanded = expandedIds.includes(category.id)
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id}>
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "group border border-[#E5DDCF] bg-white hover:border-[#7A6543]/40 transition-all duration-300 shadow-sm",
            isChild ? "ml-8 border-l-4 border-l-[#7A6543]" : "rounded-xl"
          )}
        >
          {viewMode === "grid" ? (
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {hasChildren && !isChild && (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="text-gray-500 hover:text-[#7A6543] transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <div className="w-12 h-12 rounded-lg bg-[#F5F0EB] flex items-center justify-center overflow-hidden border border-[#E5DDCF]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A] text-sm">{category.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {category.productCount} product{category.productCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={category.isActive}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: category.id, isActive: checked })
                    }
                    className="data-[state=checked]:bg-[#7A6543]"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-gray-500 hover:text-[#7A6543] hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border-[#E5DDCF] shadow-lg text-[#1A1A1A]"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEdit(category)}
                        className="cursor-pointer hover:bg-[#F5F0EB]"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!isChild && (
                        <>
                          <DropdownMenuItem
                            onClick={() => moveCategory(category.id, "up")}
                            className="cursor-pointer hover:bg-[#F5F0EB]"
                          >
                            <ArrowUp className="w-4 h-4 mr-2" />
                            Move Up
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => moveCategory(category.id, "down")}
                            className="cursor-pointer hover:bg-[#F5F0EB]"
                          >
                            <ArrowDown className="w-4 h-4 mr-2" />
                            Move Down
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setDeletingCategory(category)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="cursor-pointer text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {!isChild && category.children && (
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                  <span>{category.subcategoryCount} subcategories</span>
                  <span>{category.productCount} products</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 p-3 px-4">
              {hasChildren && !isChild && (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="text-gray-500 hover:text-[#7A6543] transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              <div className="w-10 h-10 rounded-lg bg-[#F5F0EB] flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#E5DDCF]">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#1A1A1A] text-sm truncate">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {category.description || "No description"}
                </p>
              </div>
              <div className="text-xs text-gray-500 w-24 text-right">
                {category.productCount} products
              </div>
              <div className="text-xs text-gray-500 w-28 text-right">
                {category.subcategoryCount} subcategories
              </div>
              <Switch
                checked={category.isActive}
                onCheckedChange={(checked) =>
                  toggleMutation.mutate({ id: category.id, isActive: checked })
                }
                className="data-[state=checked]:bg-[#7A6543]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-gray-500 hover:text-[#7A6543] hover:bg-gray-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white border-[#E5DDCF] shadow-lg text-[#1A1A1A]"
                >
                  <DropdownMenuItem
                    onClick={() => handleEdit(category)}
                    className="cursor-pointer hover:bg-[#F5F0EB]"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!isChild && (
                    <>
                      <DropdownMenuItem
                        onClick={() => moveCategory(category.id, "up")}
                        className="cursor-pointer hover:bg-[#F5F0EB]"
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Move Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => moveCategory(category.id, "down")}
                        className="cursor-pointer hover:bg-[#F5F0EB]"
                      >
                        <ArrowDown className="w-4 h-4 mr-2" />
                        Move Down
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setDeletingCategory(category)
                      setIsDeleteDialogOpen(true)
                    }}
                    className="cursor-pointer text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {isExpanded && category.children && viewMode === "grid" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1 mt-1"
            >
              {category.children.map((child) => renderCategoryCard(child, true))}
            </motion.div>
          )}
        </AnimatePresence>

        {isExpanded && category.children && viewMode === "list" && (
          <div className="space-y-1 mt-1">
            {category.children.map((child) => renderCategoryCard(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 md:p-6 bg-[#F5F0EB]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">
              Categories
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product categories and subcategories
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#7A6543] hover:bg-[#7A6543]/90 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543] rounded-lg shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-white border border-[#E5DDCF] rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                viewMode === "grid"
                  ? "bg-[#7A6543]/15 text-[#7A6543]"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                viewMode === "list"
                  ? "bg-[#7A6543]/15 text-[#7A6543]"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-gray-200/60 animate-pulse border border-[#E5DDCF]"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Create your first category to get started."
          />
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {viewMode === "list" && (
                <div className="flex items-center gap-4 px-4 py-2 text-xs font-semibold text-gray-500 border-b border-[#E5DDCF] uppercase tracking-wider">
                  <div className="w-10" />
                  <div className="w-10" />
                  <div className="flex-1">Category</div>
                  <div className="w-24 text-right">Products</div>
                  <div className="w-28 text-right">Subcategories</div>
                  <div className="w-12">Active</div>
                  <div className="w-8" />
                </div>
              )}
              {getDisplayCategories(filteredCategories).map((category) =>
                renderCategoryCard(category)
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Category Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-[#E5DDCF] text-[#1A1A1A] max-w-lg rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A] font-semibold text-lg">
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-h-[65vh] overflow-y-auto pr-1.5 space-y-4 pb-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("name")}
                  placeholder="Category name"
                  className="bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543]"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  {...register("description")}
                  placeholder="Category description"
                  rows={3}
                  className="bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Parent Category</label>
                <div className="relative">
                  <select
                    value={watch("parentId")}
                    onChange={(e) => setValue("parentId", e.target.value)}
                    className="flex h-10 w-full appearance-none rounded-lg border border-[#E5DDCF] bg-white px-3 py-2 pr-10 text-sm text-[#1A1A1A] transition-colors focus:outline-none focus:border-[#7A6543]"
                  >
                    <option value="">None (Top level)</option>
                    {parentCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Image Upload Box */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Category Image</label>
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[#E5DDCF] bg-gray-50 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-800 hover:bg-gray-100 text-xs"
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          setImagePreview(null)
                          setValue("image", "")
                        }}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E5DDCF] rounded-xl p-6 text-center hover:border-[#7A6543] transition-colors cursor-pointer bg-[#FDFBF9] hover:bg-[#F5F0EB]/50"
                  >
                    <Upload className="w-8 h-8 mx-auto text-[#7A6543] mb-2" />
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* SEO Section */}
              <div className="space-y-3 pt-3 border-t border-[#E5DDCF]">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SEO Settings
                </p>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">SEO Title</label>
                  <Input
                    {...register("seoTitle")}
                    placeholder="SEO title"
                    className="bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">SEO Description</label>
                  <Textarea
                    {...register("seoDescription")}
                    placeholder="SEO description"
                    rows={2}
                    className="bg-white border-[#E5DDCF] text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#7A6543] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium text-gray-700">Active Status</label>
                <Switch
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                  className="data-[state=checked]:bg-[#7A6543]"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#E5DDCF]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingCategory(null)
                  setSelectedFile(null)
                  setImagePreview(null)
                  reset()
                }}
                className="border-[#E5DDCF] text-gray-700 hover:bg-[#F5F0EB]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-[#7A6543] hover:bg-[#7A6543]/90 text-white font-medium px-6"
              >
                {saveMutation.isPending
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-[#E5DDCF] text-[#1A1A1A] max-w-md rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[#1A1A1A] font-semibold text-lg">
              Delete Category
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-2">
            {isDeleteBlocked ? (
              <p className="text-sm text-gray-600">
                <span className="text-[#1A1A1A] font-semibold">
                  {deletingCategoryLabel}
                </span>{" "}
                cannot be deleted while it contains {deletingCategory?.productCount} product
                {deletingCategory?.productCount === 1 ? "" : "s"}. Move those products to another category first.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="text-[#1A1A1A] font-semibold">
                  {deletingCategory?.name}
                </span>
                ? This action cannot be undone.
              </p>
            )}
            {!isDeletingUncategorized && deletingCategory && deletingCategory.productCount > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                Its {deletingCategory.productCount} product{deletingCategory.productCount === 1 ? "" : "s"} will be moved to Uncategorized.
              </p>
            )}
            {!isDeleteBlocked && deletingCategory?.children && deletingCategory.children.length > 0 && (
              <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                Its {deletingCategory.children.length} subcategor{deletingCategory.children.length === 1 ? "y" : "ies"}
                will be retained and moved to top level.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingCategory(null)
              }}
              className="border-[#E5DDCF] text-gray-700 hover:bg-[#F5F0EB]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deletingCategory && !isDeleteBlocked && deleteMutation.mutate(deletingCategory.id)}
              disabled={deleteMutation.isPending || isDeleteBlocked}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-5"
            >
              {isDeleteBlocked ? "Cannot Delete" : deleteMutation.isPending ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
