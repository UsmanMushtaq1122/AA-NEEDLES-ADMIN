"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  PlusCircle,
  MinusCircle,
  BriefcaseBusiness,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  description: string;
  requirements: string[];
  salary: string;
  active: boolean;
}

const mockCareers: Career[] = [
  {
    id: "cr1",
    title: "Senior Fashion Designer",
    department: "Design",
    location: "Lahore",
    type: "full-time",
    description: "We are seeking a talented Senior Fashion Designer to lead our design team in creating luxury ready-to-wear and haute couture collections. You will work closely with our creative director to translate brand vision into stunning, wearable art that celebrates Pakistani textile heritage.",
    requirements: [
      "Bachelor's degree in Fashion Design or related field",
      "5+ years of experience in luxury fashion design",
      "Proficiency in Adobe Creative Suite and CLO 3D",
      "Strong understanding of South Asian textiles and embroidery techniques",
      "Portfolio demonstrating high-end design capabilities",
      "Experience managing a small design team",
    ],
    salary: "PKR 250,000 - 350,000 / month",
    active: true,
  },
  {
    id: "cr2",
    title: "E-commerce Manager",
    department: "Digital",
    location: "Lahore",
    type: "full-time",
    description: "Join our digital team as E-commerce Manager to oversee and optimize our online retail operations. You will be responsible for driving online revenue, managing the website experience, and implementing digital marketing strategies that align with our luxury brand positioning.",
    requirements: [
      "Bachelor's degree in Business, Marketing, or related field",
      "3+ years of e-commerce management experience",
      "Experience with Shopify or similar platforms",
      "Strong analytical skills and data-driven approach",
      "Knowledge of SEO, SEM, and social media marketing",
      "Understanding of luxury retail customer behavior",
    ],
    salary: "PKR 180,000 - 250,000 / month",
    active: true,
  },
  {
    id: "cr3",
    title: "Marketing Executive",
    department: "Marketing",
    location: "Karachi",
    type: "full-time",
    description: "We are looking for a creative Marketing Executive to develop and execute marketing campaigns that elevate our brand presence. You will manage social media channels, coordinate with influencers, and create compelling content that resonates with our audience.",
    requirements: [
      "Bachelor's degree in Marketing, Communications, or related field",
      "1-3 years of marketing experience, preferably in fashion/lifestyle",
      "Excellent written and verbal communication skills",
      "Proficiency in social media management tools",
      "Experience with content creation and photography",
      "Strong understanding of the Pakistani fashion market",
    ],
    salary: "PKR 80,000 - 120,000 / month",
    active: true,
  },
  {
    id: "cr4",
    title: "Production Coordinator",
    department: "Operations",
    location: "Lahore",
    type: "full-time",
    description: "Manage the end-to-end production process from sampling to final delivery. Coordinate with our manufacturing partners to ensure quality standards are met and timelines are adhered to. You will be the bridge between design and production.",
    requirements: [
      "Bachelor's degree in Textile Engineering, Fashion Technology, or related field",
      "2+ years in garment production management",
      "Strong knowledge of fabric types and garment construction",
      "Excellent organizational and communication skills",
      "Experience with production planning and inventory management",
    ],
    salary: "PKR 100,000 - 150,000 / month",
    active: true,
  },
  {
    id: "cr5",
    title: "Fashion Photography Intern",
    department: "Creative",
    location: "Lahore",
    type: "internship",
    description: "A 6-month internship opportunity for aspiring fashion photographers. Work alongside our creative team to shoot product, editorial, and campaign imagery. This is a hands-on learning experience with potential for full-time employment.",
    requirements: [
      "Currently enrolled or recent graduate in Photography/Visual Arts",
      "Portfolio demonstrating fashion or portrait photography skills",
      "Proficiency in Adobe Lightroom and Photoshop",
      "Own camera equipment (DSLR or mirrorless)",
      "Passion for fashion and luxury branding",
      "Available for minimum 4 days per week",
    ],
    salary: "PKR 30,000 / month (stipend)",
    active: false,
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  "full-time": { label: "Full-Time", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  "part-time": { label: "Part-Time", color: "bg-blue-50 text-blue-600 border-blue-200" },
  contract: { label: "Contract", color: "bg-amber-50 text-amber-700 border-amber-200" },
  internship: { label: "Internship", color: "bg-purple-50 text-purple-600 border-purple-200" },
};

const departmentColors: Record<string, string> = {
  Design: "bg-[#C9A96E]/10 text-[#7A6543] border-[#C9A96E]/20",
  Digital: "bg-blue-50 text-blue-600 border-blue-200",
  Marketing: "bg-pink-50 text-pink-600 border-pink-200",
  Operations: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Creative: "bg-purple-50 text-purple-600 border-purple-200",
};

export default function CareersPage() {
  const [careers, setCareers] = useState(mockCareers);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time" as Career["type"],
    description: "",
    requirements: [""],
    salary: "",
    active: true,
  });

  const openAdd = () => {
    setEditingCareer(null);
    setForm({
      title: "",
      department: "",
      location: "",
      type: "full-time",
      description: "",
      requirements: [""],
      salary: "",
      active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (career: Career) => {
    setEditingCareer(career);
    setForm({
      title: career.title,
      department: career.department,
      location: career.location,
      type: career.type,
      description: career.description,
      requirements: [...career.requirements],
      salary: career.salary,
      active: career.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const filteredReqs = form.requirements.filter((r) => r.trim() !== "");
    if (editingCareer) {
      setCareers((prev) =>
        prev.map((c) =>
          c.id === editingCareer.id ? { ...c, ...form, requirements: filteredReqs } : c
        )
      );
    } else {
      setCareers((prev) => [
        ...prev,
        { id: `cr${Date.now()}`, ...form, requirements: filteredReqs },
      ]);
    }
    setDialogOpen(false);
  };

  const toggleActive = (id: string) => {
    setCareers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const deleteItem = (id: string) => {
    setCareers((prev) => prev.filter((c) => c.id !== id));
  };

  const addRequirement = () => {
    setForm({ ...form, requirements: [...form.requirements, ""] });
  };

  const removeRequirement = (index: number) => {
    if (form.requirements.length > 1) {
      setForm({
        ...form,
        requirements: form.requirements.filter((_, i) => i !== index),
      });
    }
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...form.requirements];
    updated[index] = value;
    setForm({ ...form, requirements: updated });
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="p-8 max-w-[1000px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-[#1A1A1A]">Careers</h1>
              <p className="text-[#1A1A1A]/50 mt-1 font-light">
                {careers.length} open positions
              </p>
            </div>
            <Button onClick={openAdd} className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 font-light tracking-wide">
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {careers.map((career, index) => {
                const config = typeConfig[career.type];
                const isExpanded = expandedId === career.id;
                return (
                  <motion.div
                    key={career.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white border-0 shadow-sm">
                      <CardContent className="p-0">
                        <button
                          className="w-full text-left p-5"
                          onClick={() => setExpandedId(isExpanded ? null : career.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className={cn("font-medium", career.active ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40")}>
                                  {career.title}
                                </h3>
                                <Badge className={cn("text-[9px] uppercase tracking-wider font-medium border", config.color)}>
                                  {config.label}
                                </Badge>
                                {!career.active && (
                                  <Badge className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-400 border-0">
                                    Closed
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-[#1A1A1A]/40 font-light mt-1.5 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  {career.department}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {career.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {career.salary}
                                </span>
                              </div>
                            </div>
                            <ChevronDown
                              className={cn(
                                "w-5 h-5 text-[#1A1A1A]/20 transition-transform shrink-0 ml-4",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5">
                                <Separator className="bg-stone-100 mb-4" />
                                <p className="text-sm text-[#1A1A1A]/60 font-light leading-relaxed mb-4">
                                  {career.description}
                                </p>
                                <div className="mb-4">
                                  <h4 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2">
                                    Requirements
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {career.requirements.map((req, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A1A]/50 font-light">
                                        <span className="w-1 h-1 rounded-full bg-[#C9A96E] mt-2 shrink-0" />
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex items-center gap-3 pt-3 border-t border-stone-50">
                                  <Switch
                                    checked={career.active}
                                    onCheckedChange={() => toggleActive(career.id)}
                                  />
                                  <span className="text-xs text-[#1A1A1A]/40 font-light">
                                    {career.active ? "Accepting Applications" : "Position Closed"}
                                  </span>
                                  <div className="flex-1" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-light gap-1.5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEdit(career);
                                    }}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-light text-[#8B1A1A]/50 hover:text-[#8B1A1A] gap-1.5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteItem(career.id);
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-[#1A1A1A]">
              {editingCareer ? "Edit" : "Add"} Position
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Position title..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Department</label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Design, Marketing..."
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Location</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Lahore, Karachi..."
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Type</label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val as Career["type"] })}>
                  <SelectTrigger className="border-stone-200 bg-[#F5F0EB]/50 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Salary Range</label>
                <Input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="PKR 100,000 - 150,000 / month"
                  className="border-stone-200 bg-[#F5F0EB]/50 font-light focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium mb-2 block">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Job description..."
                className="border-stone-200 bg-[#F5F0EB]/50 font-light min-h-[100px] focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 font-medium">Requirements</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-light text-[#7A6543] hover:text-[#7A6543]/80 gap-1"
                  onClick={addRequirement}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}...`}
                      className="border-stone-200 bg-[#F5F0EB]/50 font-light text-sm focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={() => removeRequirement(index)}
                      disabled={form.requirements.length <= 1}
                    >
                      <MinusCircle className="w-4 h-4 text-[#8B1A1A]/30 hover:text-[#8B1A1A]" />
                    </Button>
                  </div>
                ))}
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
                {editingCareer ? "Save Changes" : "Add Position"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
