"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users as UsersIcon } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
          Admin Users
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UsersIcon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-[#1A1A1A] mb-1">
              User Management
            </p>
            <p className="text-sm text-gray-500">
              User management API not yet implemented
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
