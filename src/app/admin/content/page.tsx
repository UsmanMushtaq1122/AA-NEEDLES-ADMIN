"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Image,
  Star,
  HelpCircle,
  FileText,
  MapPin,
  Briefcase,
  ChevronRight,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Banners",
    description: "Hero banners and announcement bars",
    href: "/admin/content/banners",
    icon: Image,
    count: 10,
    color: "from-[#1A1A1A]/5 to-[#C9A96E]/10",
    iconColor: "text-[#7A6543]",
  },
  {
    title: "Testimonials",
    description: "Customer reviews, videos, and social proof",
    href: "/admin/content/testimonials",
    icon: Star,
    count: 7,
    color: "from-amber-50 to-[#C9A96E]/5",
    iconColor: "text-[#7A6543]",
  },
  {
    title: "FAQs",
    description: "Frequently asked questions grouped by category",
    href: "/admin/content/faqs",
    icon: HelpCircle,
    count: 11,
    color: "from-blue-50 to-[#C9A96E]/5",
    iconColor: "text-blue-500",
  },
  {
    title: "Pages",
    description: "CMS pages â€” about, policies, and custom content",
    href: "/admin/content/pages",
    icon: FileText,
    count: 6,
    color: "from-emerald-50 to-[#C9A96E]/5",
    iconColor: "text-emerald-500",
  },
  {
    title: "Store Locations",
    description: "Physical store addresses, hours, and map data",
    href: "/admin/content/locations",
    icon: MapPin,
    count: 4,
    color: "from-purple-50 to-[#C9A96E]/5",
    iconColor: "text-purple-500",
  },
  {
    title: "Careers",
    description: "Job listings, departments, and application management",
    href: "/admin/content/careers",
    icon: Briefcase,
    count: 5,
    color: "from-rose-50 to-[#C9A96E]/5",
    iconColor: "text-rose-500",
  },
  {
    title: "Navigation Menu",
    description: "Mobile hamburger menu, tabs, subcategories, and promotional links",
    href: "/admin/content/navigation",
    icon: Menu,
    count: null,
    color: "from-[#C9A96E]/10 to-[#1A1A1A]/5",
    iconColor: "text-[#7A6543]",
  },
];

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/30 font-light mb-3">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#1A1A1A]/60">Content</span>
            </div>
            <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Content Management</h1>
            <p className="text-[#1A1A1A]/50 mt-1 font-light">
              Manage all website content from one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <Link href={section.href} className="block group">
                    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                      <CardContent className="p-6">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                            section.color
                          )}
                        >
                          <Icon className={cn("w-5 h-5", section.iconColor)} />
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-[#1A1A1A] group-hover:text-[#7A6543] transition-colors">
                              {section.title}
                            </h3>
                            <p className="text-sm text-[#1A1A1A]/40 font-light mt-1">
                              {section.description}
                            </p>
                          </div>
                          <span className="text-xs text-[#1A1A1A]/20 font-light bg-[#F5F0EB] rounded-full px-2.5 py-1 shrink-0 ml-3">
                            {section.count !== null ? section.count : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-xs text-[#7A6543] font-light opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Manage</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
