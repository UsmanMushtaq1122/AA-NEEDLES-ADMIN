import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[a-z]/, "Must contain at least one lowercase letter").regex(/[0-9]/, "Must contain at least one number"),
  rememberMe: z.boolean().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const descriptionSectionSchema = z.object({
  title: z.string().default(""),
  items: z.array(z.string()).default([]),
});

export const descriptionSectionsSchema = z
  .object({
    color: z.string().default(""),
    sections: z.array(descriptionSectionSchema).default([]),
    note: z.string().default(""),
  })
  .default({ color: "", sections: [], note: "" });

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  slug: z.string().optional(),
  description: z.string().optional().default(""),
  shortDescription: z.string().optional(),
  price: z
    .number({ invalid_type_error: "Invalid price value entered." })
    .finite("Invalid price value entered.")
    .min(0, "Invalid price value entered."),
  compareAtPrice: z
    .number({ invalid_type_error: "Invalid price value entered." })
    .finite("Invalid price value entered.")
    .optional()
    .catch(undefined),
  costPrice: z
    .number({ invalid_type_error: "Invalid price value entered." })
    .finite("Invalid price value entered.")
    .optional()
    .catch(undefined),
  sku: z.string().min(1, "SKU is required."),
  barcode: z.string().optional(),
  stock: z
    .number({ invalid_type_error: "Invalid stock value entered." })
    .finite("Invalid stock value entered.")
    .min(0, "Stock cannot be negative."),
  lowStockThreshold: z
    .number({ invalid_type_error: "Invalid low stock threshold value entered." })
    .finite("Invalid low stock threshold value entered.")
    .catch(5),
  weight: z
    .number({ invalid_type_error: "Invalid weight value entered." })
    .finite("Invalid weight value entered.")
    .optional()
    .catch(undefined),
  status: z.enum(["active", "draft", "archived"]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  categoryIds: z.array(z.string()).min(1, "Please select at least one category."),
  tags: z.array(z.string()).default([]),
  descriptionSections: descriptionSectionsSchema,
  fabric: z.string().default(""),
  sizes: z.array(z.string().trim().min(1, "Size cannot be empty.")).default([]),
  careInstructions: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  image: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  mobileImage: z.string().optional(),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  type: z.enum(["hero", "announcement"]),
});

export const testimonialSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerImage: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  rating: z.number().min(1).max(5),
  type: z.enum(["gallery", "video", "instagram", "story"]),
  image: z.string().optional(),
  videoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().min(1, "Category is required"),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0.01, "Value must be positive"),
  minOrderAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  usageLimit: z.number().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const storeLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  hours: z.string().min(1, "Hours are required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().default(true),
});

export const careerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["full_time", "part_time", "contract", "internship"]),
  description: z.string().min(1, "Description is required"),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  salary: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const cmsPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const settingsSchema = z.object({
  brandName: z.string().min(1),
  brandDescription: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  address: z.string().min(1),
  shippingCost: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  codFee: z.number().min(0).optional(),
  returnWindowDays: z.number().min(0),
  exchangeWindowDays: z.number().min(0),
  socialLinks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
  }),
  seoDefaults: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }).optional(),
});

export const shippingSchema = z.object({
  shippingCost: z.number().min(0),
  expressShippingCost: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  codFee: z.number().min(0),
  codEnabled: z.boolean(),
});

export const seoSettingsSchema = z.object({
  metaTitle: z.string().min(1).max(60).optional(),
  metaDescription: z.string().min(1).max(160).optional(),
  baseUrl: z.string().url().optional(),
  canonicalUrl: z.boolean(),
});

export const adminUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "staff", "content_manager"]),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});
