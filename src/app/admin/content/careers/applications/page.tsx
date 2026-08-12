"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Briefcase, Mail, Phone, Globe, Loader2, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface JobApplication {
  id: string;
  careerId: string;
  name: string;
  email: string;
  phone: string | null;
  portfolio: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  career: { id: string; title: string; department: string };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-50 text-blue-600 border-blue-200" },
  reviewed: { label: "Reviewed", color: "bg-amber-50 text-amber-700 border-amber-200" },
  shortlisted: { label: "Shortlisted", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-stone-100 text-stone-500 border-stone-200" },
};

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get<any>("/careers/applications");
      setApplications(res.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Job Applications</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">
                {applications.length} application{applications.length !== 1 ? "s" : ""} received
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#C9A96E]" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-[#8B1A1A]">{error}</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-10 h-10 mx-auto text-[#1A1A1A]/20 mb-4" />
              <p className="text-[#1A1A1A]/50 font-light">No applications yet. They will appear here once candidates apply.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-base font-medium text-[#1A1A1A]">{app.name}</h2>
                          <Badge className={cn("text-[9px] uppercase tracking-wider font-medium border", statusConfig[app.status]?.color || statusConfig.new.color)}>
                            {statusConfig[app.status]?.label || app.status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#1A1A1A]/50 font-light flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {app.career?.title || "Position"}
                          </span>
                          {app.career?.department && (
                            <span className="text-[#1A1A1A]/30">·</span>
                          )}
                          {app.career?.department && <span>{app.career.department}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-[#1A1A1A]/30 font-light shrink-0">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>

                    <Separator className="bg-stone-100 my-4" />

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#1A1A1A]/60 font-light">
                      <span className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/30" />
                        <a href={`mailto:${app.email}`} className="hover:text-[#7A6543]">{app.email}</a>
                      </span>
                      {app.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/30" />
                          {app.phone}
                        </span>
                      )}
                      {app.portfolio && (
                        <span className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-[#1A1A1A]/30" />
                          <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-[#7A6543]">
                            Portfolio / LinkedIn
                          </a>
                        </span>
                      )}
                    </div>

                    {app.message && (
                      <p className="mt-4 text-sm text-[#1A1A1A]/60 font-light leading-relaxed bg-[#F5F0EB]/50 border border-stone-100 rounded-lg p-4">
                        {app.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
