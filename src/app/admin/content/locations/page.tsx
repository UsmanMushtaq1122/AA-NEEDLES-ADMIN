"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  hours: string;
  lat: number;
  lng: number;
  active: boolean;
}

const mockLocations: StoreLocation[] = [
  {
    id: "loc1",
    name: "AA Neddles — Flagship Store",
    address: "24-C, MM Alam Road, Gulberg III",
    city: "Lahore",
    province: "Punjab",
    phone: "+92 42 3578 1234",
    email: "lahore@aanneddles.com",
    hours: "Mon-Sat: 11:00 AM - 9:00 PM | Sun: 12:00 PM - 8:00 PM",
    lat: 31.5204,
    lng: 74.3587,
    active: true,
  },
  {
    id: "loc2",
    name: "AA Neddles — Clifton",
    address: "Block 5, Seaview Boulevard",
    city: "Karachi",
    province: "Sindh",
    phone: "+92 21 3587 5678",
    email: "karachi@aanneddles.com",
    hours: "Mon-Sat: 11:00 AM - 9:00 PM | Sun: 12:00 PM - 8:00 PM",
    lat: 24.8607,
    lng: 67.0011,
    active: true,
  },
  {
    id: "loc3",
    name: "AA Neddles — F-8",
    address: "15, Jinnah Avenue, F-8/2",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    phone: "+92 51 2654 9012",
    email: "islamabad@aanneddles.com",
    hours: "Mon-Sat: 10:00 AM - 8:00 PM | Sun: Closed",
    lat: 33.6844,
    lng: 73.0479,
    active: true,
  },
  {
    id: "loc4",
    name: "AA Neddles — DHA",
    address: "33, Commercial Area, DHA Phase 6",
    city: "Lahore",
    province: "Punjab",
    phone: "+92 42 3713 4567",
    email: "dha@aanneddles.com",
    hours: "Mon-Sat: 11:00 AM - 9:00 PM | Sun: 12:00 PM - 8:00 PM",
    lat: 31.4739,
    lng: 74.3740,
    active: false,
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState(mockLocations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    email: "",
    hours: "",
    lat: 0,
    lng: 0,
    active: true,
  });

  const openAdd = () => {
    setEditingLocation(null);
    setForm({
      name: "",
      address: "",
      city: "",
      province: "",
      phone: "",
      email: "",
      hours: "",
      lat: 31.5204,
      lng: 74.3587,
      active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (loc: StoreLocation) => {
    setEditingLocation(loc);
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      province: loc.province,
      phone: loc.phone,
      email: loc.email,
      hours: loc.hours,
      lat: loc.lat,
      lng: loc.lng,
      active: loc.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingLocation) {
      setLocations((prev) =>
        prev.map((l) => (l.id === editingLocation.id ? { ...l, ...form } : l))
      );
    } else {
      setLocations((prev) => [
        ...prev,
        { id: `loc${Date.now()}`, ...form },
      ]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  const deleteItem = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Store Locations</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">{locations.length} locations</p>
            </div>
            <Button onClick={openAdd} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {locations.map((loc, index) => (
                  <motion.div
                    key={loc.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white border-0 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-[#1A1A1A]">{loc.name}</h3>
                              {!loc.active && (
                                <Badge className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#1A1A1A]/50 font-light">{loc.city}, {loc.province}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={loc.active}
                              onCheckedChange={() => toggleActive(loc.id)}
                            />
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(loc)}>
                              <Pencil className="w-4 h-4 text-[#1A1A1A]/40" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteItem(loc.id)}>
                              <Trash2 className="w-4 h-4 text-[#8B1A1A]/40 hover:text-[#8B1A1A]" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#7A6543] mt-0.5 shrink-0" />
                            <p className="text-sm text-[#1A1A1A]/60 font-light">{loc.address}</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <Phone className="w-4 h-4 text-[#7A6543] mt-0.5 shrink-0" />
                            <p className="text-sm text-[#1A1A1A]/60 font-light">{loc.phone}</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <Mail className="w-4 h-4 text-[#7A6543] mt-0.5 shrink-0" />
                            <p className="text-sm text-[#1A1A1A]/60 font-light">{loc.email}</p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <Clock className="w-4 h-4 text-[#7A6543] mt-0.5 shrink-0" />
                            <p className="text-sm text-[#1A1A1A]/60 font-light">{loc.hours}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <Card className="bg-white border-0 shadow-sm sticky top-8">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#1A1A1A] uppercase tracking-widest">
                    Map Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-[#F5F0EB] rounded-lg h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-[30%] left-[20%] w-2 h-2 rounded-full bg-[#C9A96E]" />
                      <div className="absolute top-[45%] left-[65%] w-2 h-2 rounded-full bg-[#C9A96E]" />
                      <div className="absolute top-[25%] left-[50%] w-2 h-2 rounded-full bg-[#C9A96E]" />
                    </div>
                    <Navigation className="w-8 h-8 text-[#1A1A1A]/15 mb-3" />
                    <p className="text-xs text-[#1A1A1A]/30 font-light text-center">
                      Interactive map
                    </p>
                    <p className="text-[10px] text-[#1A1A1A]/20 font-light text-center mt-1">
                      Google Maps integration
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {locations
                      .filter((l) => l.active)
                      .map((loc) => (
                        <div key={loc.id} className="flex items-center gap-2 text-xs text-[#1A1A1A]/50 font-light">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
                          <span>{loc.city}</span>
                          <span className="text-[#1A1A1A]/20">·</span>
                          <span className="text-[#1A1A1A]/30">
                            {loc.lat.toFixed(2)}°N, {loc.lng.toFixed(2)}°E
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingLocation ? "Edit" : "Add"} Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Store Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="AA Neddles — Location Name"
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Address</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City..."
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Province</label>
                <Input
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  placeholder="Province..."
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 42 3578 1234"
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Email</label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="location@aanneddles.com"
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Business Hours</label>
              <Input
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                placeholder="Mon-Sat: 11:00 AM - 9:00 PM"
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light font-mono text-sm focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light font-mono text-sm focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">Active</label>
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-stone-200 text-[#1A1A1A]/60 font-light">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
                {editingLocation ? "Save Changes" : "Add Location"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
