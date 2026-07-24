"use client"

import { useState } from "react"
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
import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
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
import { StatusBadge } from "@/components/ui/status-badge"

interface CategoryItem extends Category {
  productCount: number
  subcategoryCount: number
  isActive: boolean
  image?: string
  children?: CategoryItem[]
  subcategories?: CategoryItem[]
}

const mockCategories: CategoryItem[] = [
  {
    id: "1",
    name: "Unstitched",
    slug: "unstitched",
    description: "Premium unstitched fabric collections for custom tailoring",
    productCount: 145,
    subcategoryCount: 6,
    isActive: true,
    sortOrder: 0,
    createdAt: "2024-01-15",
    image: "/categories/unstitched.jpg",
    children: [
      {
        id: "1-1",
        name: "Lawn",
        slug: "lawn",
        description: "Premium lawn fabric",
        productCount: 42,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 0,
        createdAt: "2024-01-15",
      },
      {
        id: "1-2",
        name: "Silk",
        slug: "silk",
        description: "Luxurious silk collections",
        productCount: 28,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-15",
      },
      {
        id: "1-3",
        name: "Chiffon",
        slug: "chiffon",
        description: "Elegant chiffon fabrics",
        productCount: 35,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-15",
      },
      {
        id: "1-4",
        name: "Cotton",
        slug: "cotton",
        description: "Premium cotton fabrics",
        productCount: 22,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 3,
        createdAt: "2024-01-15",
      },
      {
        id: "1-5",
        name: "Organza",
        slug: "organza",
        description: "Delicate organza collection",
        productCount: 12,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 4,
        createdAt: "2024-01-15",
      },
      {
        id: "1-6",
        name: "Karandi",
        slug: "karandi",
        description: "Winter karandi collection",
        productCount: 6,
        subcategoryCount: 0,
        isActive: false,
        sortOrder: 5,
        createdAt: "2024-01-15",
      },
    ],
  },
  {
    id: "2",
    name: "Stitched",
    slug: "stitched",
    description: "Ready to wear stitched luxury outfits",
    productCount: 89,
    subcategoryCount: 5,
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-15",
    image: "/categories/stitched.jpg",
    children: [
      {
        id: "2-1",
        name: "Kurtis",
        slug: "kurtis",
        description: "Designer kurtis",
        productCount: 30,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 0,
        createdAt: "2024-01-15",
      },
      {
        id: "2-2",
        name: "Suits",
        slug: "suits",
        description: "Formal suits",
        productCount: 24,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-15",
      },
      {
        id: "2-3",
        name: "Lehengas",
        slug: "lehengas",
        description: "Bridal and party lehengas",
        productCount: 15,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-15",
      },
      {
        id: "2-4",
        name: "Shalwar Kameez",
        slug: "shalwar-kameez",
        description: "Traditional shalwar kameez",
        productCount: 12,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 3,
        createdAt: "2024-01-15",
      },
      {
        id: "2-5",
        name: "Maxi Dresses",
        slug: "maxi-dresses",
        description: "Flowing maxi dresses",
        productCount: 8,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 4,
        createdAt: "2024-01-15",
      },
    ],
  },
  {
    id: "3",
    name: "Pret",
    slug: "pret",
    description: "Contemporary ready-to-wear pret collections",
    productCount: 67,
    subcategoryCount: 4,
    isActive: true,
    sortOrder: 2,
    createdAt: "2024-01-15",
    image: "/categories/pret.jpg",
    children: [
      {
        id: "3-1",
        name: "Casual Pret",
        slug: "casual-pret",
        description: "Everyday casual wear",
        productCount: 25,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 0,
        createdAt: "2024-01-15",
      },
      {
        id: "3-2",
        name: "Formal Pret",
        slug: "formal-pret",
        description: "Elegant formal wear",
        productCount: 18,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-15",
      },
      {
        id: "3-3",
        name: "Fusion Wear",
        slug: "fusion-wear",
        description: "East meets west",
        productCount: 14,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-15",
      },
      {
        id: "3-4",
        name: "Workwear",
        slug: "workwear",
        description: "Professional attire",
        productCount: 10,
        subcategoryCount: 0,
        isActive: false,
        sortOrder: 3,
        createdAt: "2024-01-15",
      },
    ],
  },
  {
    id: "4",
    name: "Accessories",
    slug: "accessories",
    description: "Luxury accessories and embellishments",
    productCount: 52,
    subcategoryCount: 5,
    isActive: true,
    sortOrder: 3,
    createdAt: "2024-01-15",
    image: "/categories/accessories.jpg",
    children: [
      {
        id: "4-1",
        name: "Dupattas",
        slug: "dupattas",
        description: "Embroidered dupattas",
        productCount: 18,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 0,
        createdAt: "2024-01-15",
      },
      {
        id: "4-2",
        name: "Clutches",
        slug: "clutches",
        description: "Designer clutches",
        productCount: 10,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-15",
      },
      {
        id: "4-3",
        name: "Shawls",
        slug: "shawls",
        description: "Luxury shawls",
        productCount: 12,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-15",
      },
      {
        id: "4-4",
        name: "Jewelry",
        slug: "jewelry",
        description: "Statement jewelry pieces",
        productCount: 7,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 3,
        createdAt: "2024-01-15",
      },
      {
        id: "4-5",
        name: "Scarves",
        slug: "scarves",
        description: "Premium scarves",
        productCount: 5,
        subcategoryCount: 0,
        isActive: false,
        sortOrder: 4,
        createdAt: "2024-01-15",
      },
    ],
  },
  {
    id: "5",
    name: "Fabrics",
    slug: "fabrics",
    description: "Raw fabrics by the yard for custom creations",
    productCount: 38,
    subcategoryCount: 4,
    isActive: true,
    sortOrder: 4,
    createdAt: "2024-01-15",
    image: "/categories/fabrics.jpg",
    children: [
      {
        id: "5-1",
        name: "Raw Silk",
        slug: "raw-silk",
        description: "Premium raw silk fabric",
        productCount: 12,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 0,
        createdAt: "2024-01-15",
      },
      {
        id: "5-2",
        name: "Velvet",
        slug: "velvet",
        description: "Luxurious velvet fabric",
        productCount: 10,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-15",
      },
      {
        id: "5-3",
        name: "Net",
        slug: "net",
        description: "Decorative net fabric",
        productCount: 8,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-15",
      },
      {
        id: "5-4",
        name: "Georgette",
        slug: "georgette",
        description: "Flowing georgette",
        productCount: 8,
        subcategoryCount: 0,
        isActive: true,
        sortOrder: 3,
        createdAt: "2024-01-15",
      },
    ],
  },
]

interface CategoryFormData {
  name: string
  description: string
  parentId: string
  image: string
  seoTitle: string
  seoDescription: string
  isActive: boolean
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [expandedIds, setExpandedIds] = useState<string[]>(["1", "2", "3", "4", "5"])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)

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

  const { data: categories = mockCategories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockCategories
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { id: Date.now().toString(), ...data }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsDialogOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return { id, ...data }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsDialogOpen(false)
      setEditingCategory(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 800))
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsDeleteDialogOpen(false)
      setDeletingCategory(null)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return { id, isActive }
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

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category)
    setValue("name", category.name)
    setValue("description", category.description || "")
    setValue("parentId", "")
    setValue("image", category.image || "")
    setValue("seoTitle", category.name)
    setValue("seoDescription", category.description || "")
    setValue("isActive", category.isActive)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
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

  const onSubmit = (data: any) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const parentCategories = categories.filter((cat) => !cat.parentId)

  const getDisplayCategories = (cats: CategoryItem[]): CategoryItem[] => {
    return cats.map((cat) => ({
      ...cat,
      children: expandedIds.includes(cat.id) ? cat.children : undefined,
    }))
  }

  const moveCategory = (categoryId: string, direction: "up" | "down") => {
    const idx = categories.findIndex((c) => c.id === categoryId)
    if (direction === "up" && idx > 0) {
      const newCats = [...categories]
      ;[newCats[idx - 1], newCats[idx]] = [newCats[idx], newCats[idx - 1]]
    } else if (direction === "down" && idx < categories.length - 1) {
      const newCats = [...categories]
      ;[newCats[idx], newCats[idx + 1]] = [newCats[idx + 1], newCats[idx]]
    }
  }

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
            "group border border-[#F5F0EB]/10 bg-[#1A1A1A] hover:border-[#C9A96E]/30 transition-all duration-300",
            isChild ? "ml-8 border-l-2 border-l-[#C9A96E]/30" : "rounded-lg"
          )}
        >
          {viewMode === "grid" ? (
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {hasChildren && !isChild && (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="text-[#F5F0EB]/50 hover:text-[#C9A96E] transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <div className="w-12 h-12 rounded-lg bg-[#F5F0EB]/5 flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <div className="w-full h-full bg-gradient-to-br from-[#C9A96E]/20 to-[#8B1A1A]/20 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-[#C9A96E]/60" />
                      </div>
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#F5F0EB]/30" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#F5F0EB] text-sm">{category.name}</h3>
                    <p className="text-xs text-[#F5F0EB]/40 mt-0.5">
                      {category.productCount} products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={category.isActive}
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: category.id, isActive: checked })
                    }
                    className="data-[state=checked]:bg-[#C9A96E]"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-[#F5F0EB]/50 hover:text-[#C9A96E]"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#2A2A2A] border-[#F5F0EB]/10"
                    >
                      <DropdownMenuItem
                        onClick={() => handleEdit(category)}
                        className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!isChild && (
                        <>
                          <DropdownMenuItem
                            onClick={() => moveCategory(category.id, "up")}
                            className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5"
                          >
                            <ArrowUp className="w-4 h-4 mr-2" />
                            Move Up
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => moveCategory(category.id, "down")}
                            className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5"
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
                        className="text-red-400 hover:bg-red-400/10 focus:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {!isChild && category.children && (
                <div className="flex items-center gap-4 text-xs text-[#F5F0EB]/40 mt-2 pt-2 border-t border-[#F5F0EB]/5">
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
                  className="text-[#F5F0EB]/50 hover:text-[#C9A96E] transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              <div className="w-10 h-10 rounded-lg bg-[#F5F0EB]/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                {category.image ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#C9A96E]/20 to-[#8B1A1A]/20 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-[#C9A96E]/60" />
                  </div>
                ) : (
                  <ImageIcon className="w-4 h-4 text-[#F5F0EB]/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[#F5F0EB] text-sm truncate">
                  {category.name}
                </h3>
                <p className="text-xs text-[#F5F0EB]/40 truncate">
                  {category.description || "No description"}
                </p>
              </div>
              <div className="text-xs text-[#F5F0EB]/50 w-24 text-right">
                {category.productCount} products
              </div>
              <div className="text-xs text-[#F5F0EB]/50 w-28 text-right">
                {category.subcategoryCount} subcategories
              </div>
              <Switch
                checked={category.isActive}
                onCheckedChange={(checked) =>
                  toggleMutation.mutate({ id: category.id, isActive: checked })
                }
                className="data-[state=checked]:bg-[#C9A96E]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-[#F5F0EB]/50 hover:text-[#C9A96E]"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#2A2A2A] border-[#F5F0EB]/10"
                >
                  <DropdownMenuItem
                    onClick={() => handleEdit(category)}
                    className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!isChild && (
                    <>
                      <DropdownMenuItem
                        onClick={() => moveCategory(category.id, "up")}
                        className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5"
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Move Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => moveCategory(category.id, "down")}
                        className="text-[#F5F0EB] hover:bg-[#F5F0EB]/5 focus:bg-[#F5F0EB]/5"
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
                    className="text-red-400 hover:bg-red-400/10 focus:bg-red-400/10"
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
    <div className="min-h-screen bg-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-[#F5F0EB] tracking-wide">
              Categories
            </h1>
            <p className="text-sm text-[#F5F0EB]/40 mt-1">
              Manage your product categories and subcategories
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#C9A96E] hover:bg-[#C9A96E]/90 text-[#1A1A1A] font-medium px-5 py-2.5 rounded-lg transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#F5F0EB]/30" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:border-[#C9A96E]/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0EB]/30 hover:text-[#F5F0EB]/60"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#F5F0EB]/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                viewMode === "grid"
                  ? "bg-[#C9A96E]/20 text-[#C9A96E]"
                  : "text-[#F5F0EB]/40 hover:text-[#F5F0EB]/60"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                viewMode === "list"
                  ? "bg-[#C9A96E]/20 text-[#C9A96E]"
                  : "text-[#F5F0EB]/40 hover:text-[#F5F0EB]/60"
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
                className="h-20 rounded-lg bg-[#F5F0EB]/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Create your first category to get started."
          />
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {viewMode === "list" && (
                <div className="flex items-center gap-4 px-4 py-2 text-xs text-[#F5F0EB]/30 border-b border-[#F5F0EB]/10">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#2A2A2A] border-[#F5F0EB]/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#F5F0EB] font-light tracking-wide">
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] overflow-y-auto pr-1.5 space-y-5 pb-4">
              <div className="space-y-2">
                <label className="text-sm text-[#F5F0EB]/60">Name</label>
                <Input
                  {...register("name")}
                  placeholder="Category name"
                  className="bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E] transition-all duration-200"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#F5F0EB]/60">Description</label>
                <Textarea
                  {...register("description")}
                  placeholder="Category description"
                  rows={3}
                  className="bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E] transition-all duration-200 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#F5F0EB]/60">Parent Category</label>
                <div className="relative">
                  <select
                    value={watch("parentId")}
                    onChange={(e) => setValue("parentId", e.target.value)}
                    className="flex h-10 w-full appearance-none rounded-lg border border-[#F5F0EB]/10 bg-[#F5F0EB]/5 px-3 py-2 pr-10 text-sm text-[#F5F0EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E]"
                  >
                    <option value="" className="bg-[#2A2A2A] text-[#F5F0EB]">
                      None (Top level)
                    </option>
                    {parentCategories.map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        className="bg-[#2A2A2A] text-[#F5F0EB]"
                      >
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5F0EB]/40 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#F5F0EB]/60">Image</label>
                <div className="border-2 border-dashed border-[#F5F0EB]/10 rounded-lg p-6 text-center hover:border-[#C9A96E]/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-[#F5F0EB]/20 mb-2" />
                  <p className="text-sm text-[#F5F0EB]/40">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-[#F5F0EB]/20 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-[#F5F0EB]/10">
                <p className="text-xs text-[#F5F0EB]/30 uppercase tracking-wider">
                  SEO Settings
                </p>
                <div className="space-y-2">
                  <label className="text-sm text-[#F5F0EB]/60">SEO Title</label>
                  <Input
                    {...register("seoTitle")}
                    placeholder="SEO title"
                    className="bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E] transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#F5F0EB]/60">
                    SEO Description
                  </label>
                  <Textarea
                    {...register("seoDescription")}
                    placeholder="SEO description"
                    rows={2}
                    className="bg-[#F5F0EB]/5 border-[#F5F0EB]/10 text-[#F5F0EB] placeholder:text-[#F5F0EB]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E] transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm text-[#F5F0EB]/60">Active</label>
                <Switch
                  checked={watch("isActive")}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                  className="data-[state=checked]:bg-[#C9A96E]"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#F5F0EB]/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingCategory(null)
                  reset()
                }}
                className="text-[#F5F0EB]/60 hover:text-[#F5F0EB] hover:bg-[#F5F0EB]/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#C9A96E] hover:bg-[#C9A96E]/90 text-[#1A1A1A] font-medium px-6"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#2A2A2A] border-[#F5F0EB]/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F5F0EB] font-light tracking-wide">
              Delete Category
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[#F5F0EB]/60">
              Are you sure you want to delete{" "}
              <span className="text-[#F5F0EB] font-medium">
                {deletingCategory?.name}
              </span>
              ? This action cannot be undone.
            </p>
            {deletingCategory?.children && deletingCategory.children.length > 0 && (
              <p className="text-xs text-red-400/80 mt-2">
                This category has {deletingCategory.children.length} subcategories
                that will also be deleted.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingCategory(null)
              }}
              className="text-[#F5F0EB]/60 hover:text-[#F5F0EB] hover:bg-[#F5F0EB]/5"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}