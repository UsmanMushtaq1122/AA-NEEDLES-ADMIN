"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const segmentLabels: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  customers: "Customers",
  content: "Content Management",
  banners: "Banners",
  testimonials: "Testimonials",
  faqs: "FAQs",
  pages: "Pages",
  locations: "Locations",
  careers: "Careers",
  applications: "Job Applications",
  marketing: "Marketing",
  newsletter: "Newsletter",
  messages: "Messages",
  reviews: "Reviews",
  coupons: "Coupons",
  payments: "Payments",
  settings: "Settings",
  general: "General",
  shipping: "Shipping",
  seo: "SEO",
  users: "Admin Users",
  "admin-users": "Admin Users",
  login: "Login",
};

function formatSegment(segment: string): string {
  return (
    segmentLabels[segment] ||
    segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

interface BreadcrumbsProps {
  pathname: string;
}

export default function Breadcrumbs({ pathname }: BreadcrumbsProps) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1 && segments[0] === "admin") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C9A96E]/15 text-[#7A6543]">
          <Home size={14} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] md:text-sm">
          Dashboard Overview
        </span>
      </div>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs md:text-sm">
      <Link
        href="/admin"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#1A1A1A]"
        title="Dashboard"
      >
        <Home size={15} />
      </Link>

      {segments.map((segment, index) => {
        if (segment === "admin") return null;

        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = formatSegment(segment);

        return (
          <div key={href} className="flex items-center gap-1.5">
            <ChevronRight size={13} className="text-gray-300 stroke-[2.5]" />
            {isLast ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[#1A1A1A]/5 px-2.5 py-0.5 text-xs font-semibold text-[#1A1A1A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E]" />
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="font-medium text-gray-500 transition-colors hover:text-[#1A1A1A]"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

