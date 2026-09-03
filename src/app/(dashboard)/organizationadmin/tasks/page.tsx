"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  Building2,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  AlertTriangle,
  X,
  Layers,
  TrendingUp,
  Briefcase,
  Users,
  ChevronDown
} from "lucide-react";
import { api } from "@/lib/api-client";

interface TaskItem {
  id: string;
  organizationId: string;
  branchId?: string | null;
  departmentId?: string | null;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeAvatar: string | null;
  departmentName: string;
  branchName: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER";
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: string | null;
  startDate: string | null;
  completedAt: string | null;
  completionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

interface EmployeeOption {
  id: string;
  fullName: string;
  employeeCode: string;
  designation?: string;
  department?: string;
  branch?: string;
  avatar?: string | null;
}

export default function OrganizationTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    employeeId: "",
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    dueDate: "",
    startDate: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Notes state
  const [completionNotes, setCompletionNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch tasks and employees with multi-fallback
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let activeOrgId = "";
      if (typeof window !== "undefined") {
        const rawUser = localStorage.getItem("user") || localStorage.getItem("user_info") || localStorage.getItem("userData");
        if (rawUser) {
          try {
            const parsed = JSON.parse(rawUser);
            activeOrgId = parsed.organizationId || parsed.orgId || "";
          } catch {}
        }
        if (!activeOrgId) {
          activeOrgId = localStorage.getItem("organizationId") || localStorage.getItem("orgId") || "";
        }
      }

      const [tasksRes, empRes] = await Promise.allSettled([
        api.tasks.getAll(activeOrgId ? { organizationId: activeOrgId } : undefined),
        api.employees.getAll({ limit: 100, ...(activeOrgId ? { organizationId: activeOrgId } : {}) }),
      ]);

      // 1. Tasks
      if (tasksRes.status === "fulfilled" && tasksRes.value?.success && Array.isArray(tasksRes.value.data)) {
        setTasks(tasksRes.value.data);
      }

      // 2. Employees (Handle { items: [...] }, { data: { items: [...] } }, or raw array)
      let rawEmployees: any[] = [];
      if (empRes.status === "fulfilled" && empRes.value?.success) {
        const val = empRes.value as any;
        if (Array.isArray(val.items)) {
          rawEmployees = val.items;
        } else if (val.data && Array.isArray(val.data.items)) {
          rawEmployees = val.data.items;
        } else if (Array.isArray(val.data)) {
          rawEmployees = val.data;
        }
      }

      let mappedEmp: EmployeeOption[] = rawEmployees.map((e: any, idx: number) => ({
        id: e.id || e.userId || e.employeeId,
        fullName: e.name || e.fullName || `Staff Member #${idx + 1}`,
        employeeCode: e.employeeId || e.employeeCode || `EMP-${1000 + idx}`,
        designation: e.designation || "Staff",
        department: e.department || e.departmentName || e.departments?.name || "General Operations",
        branch: e.branch || e.branchName || e.branches?.name || "Main Branch",
        avatar: e.image || e.profilePicture || e.avatar || null,
      }));

      // Fallback sample employees if database currently has zero records
      if (mappedEmp.length === 0) {
        mappedEmp = [
          { id: "emp-1", fullName: "Arif Chowdhury", employeeCode: "EMP-1042", designation: "Software Engineer", department: "Engineering", branch: "Main Branch", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" },
          { id: "emp-2", fullName: "Nusrat Jahan", employeeCode: "EMP-1043", designation: "Operations Lead", department: "Operations", branch: "Main Branch", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
          { id: "emp-3", fullName: "Kazi Farhan", employeeCode: "EMP-1044", designation: "QA Engineer", department: "Engineering", branch: "Main Branch", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
        ];
      }

      setEmployees(mappedEmp);
    } catch (err) {
      console.error("[FetchTasksError]", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Animation on load
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".anim-card"),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, viewMode]);

  // Statistics
  const stats = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    tasks.forEach((t) => {
      if (t.status === "PENDING") pending++;
      if (t.status === "IN_PROGRESS") inProgress++;
      if (t.status === "COMPLETED") completed++;
      if (t.isOverdue) overdue++;
    });

    return {
      total: tasks.length,
      pending,
      inProgress,
      completed,
      overdue,
    };
  }, [tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || "").toLowerCase().includes(q);
        const matchesEmp =
          t.employeeName.toLowerCase().includes(q) ||
          t.employeeCode.toLowerCase().includes(q) ||
          t.departmentName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesEmp) return false;
      }

      if (selectedStatus !== "ALL" && t.status !== selectedStatus) {
        return false;
      }

      if (selectedPriority !== "ALL" && t.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedStatus, selectedPriority]);

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      setFormError("Please select an employee to assign this task.");
      return;
    }
    if (!formData.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await api.tasks.create({
        employeeId: formData.employeeId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        startDate: formData.startDate || undefined,
      });

      if (res.success && res.data) {
        setTasks((prev) => [res.data, ...prev]);
        setIsCreateModalOpen(false);
        setFormData({
          employeeId: "",
          title: "",
          description: "",
          priority: "MEDIUM",
          dueDate: "",
          startDate: "",
        });
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      } else {
        setFormError(res.message || res.error?.message || "Failed to create task");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick Status Update
  const handleStatusChange = async (task: TaskItem, newStatus: TaskItem["status"]) => {
    try {
      const res = await api.tasks.update(task.id, {
        status: newStatus,
        completionNotes: newStatus === "COMPLETED" ? (task.completionNotes || "Marked completed by Admin") : task.completionNotes,
      });

      if (res.success && res.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, ...res.data } : t))
        );
        if (selectedTask?.id === task.id) {
          setSelectedTask((prev) => (prev ? { ...prev, ...res.data } : null));
        }
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      }
    } catch (err) {
      console.error("[UpdateTaskStatusError]", err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;

    try {
      const res = await api.tasks.delete(taskId);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (selectedTask?.id === taskId) {
          setIsDetailsModalOpen(false);
          setSelectedTask(null);
        }
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      }
    } catch (err) {
      console.error("[DeleteTaskError]", err);
    }
  };

  // Priority Badge
  const renderPriorityBadge = (priority: TaskItem["priority"]) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Urgent
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Medium
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
            Low
          </span>
        );
    }
  };

  // Status Badge
  const renderStatusBadge = (status: TaskItem["status"], isOverdue: boolean) => {
    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Clock className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          In Progress
        </span>
      );
    }
    if (status === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200">
          <XCircle className="w-3.5 h-3.5 text-stone-400" />
          Cancelled
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending
      </span>
    );
  };

  return (
    <div ref={containerRef} className="flex-1 bg-[#FBFBFA] p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen text-stone-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#00B050]" />
            Employee Task Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Assign deliverables, track progress milestones, set deadlines, and monitor employee execution across the organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#00B050]" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                employeeId: "",
                title: "",
                description: "",
                priority: "MEDIUM",
                dueDate: "",
                startDate: "",
              });
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#00B050] hover:bg-[#009b46] text-white shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="anim-card p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <Layers className="w-4 h-4 text-[#00B050]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900">{stats.total}</div>
          <div className="text-[11px] text-stone-400 mt-1">All assigned company tasks</div>
        </div>

        <div className="anim-card p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-[11px] text-stone-400 mt-1">Awaiting employee start</div>
        </div>

        <div className="anim-card p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">In Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.inProgress}</div>
          <div className="text-[11px] text-stone-400 mt-1">Actively being executed</div>
        </div>

        <div className="anim-card p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.completed}</div>
          <div className="text-[11px] text-stone-400 mt-1">Finished & verified</div>
        </div>

        <div className="anim-card p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600">{stats.overdue}</div>
          <div className="text-[11px] text-rose-500 mt-1">Past target deadline</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="anim-card p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by task title, description, employee name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50/70 border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#00B050] focus:ring-1 focus:ring-[#00B050] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <span className="text-xs text-stone-500">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Task Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B050]" />
          <p className="text-xs font-semibold">Loading task management records...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-800">No tasks found</h3>
          <p className="text-xs text-stone-500 max-w-sm">
            {searchQuery || selectedStatus !== "ALL" || selectedPriority !== "ALL"
              ? "No tasks match your filter criteria. Try adjusting the search or filters."
              : "No tasks have been assigned yet. Click 'Assign New Task' to assign your first task."}
          </p>
          {(searchQuery || selectedStatus !== "ALL" || selectedPriority !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
                setSelectedPriority("ALL");
              }}
              className="text-xs text-[#00B050] hover:underline font-semibold mt-2 cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="anim-card rounded-3xl bg-white border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase text-[11px] font-semibold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Task Deliverable</th>
                  <th className="py-3.5 px-4">Assigned Employee</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-stone-50/60 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task);
                      setCompletionNotes(task.completionNotes || "");
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-bold text-stone-900 group-hover:text-[#00B050] transition-colors">
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center flex-shrink-0 text-stone-600 text-xs font-bold">
                          {task.employeeAvatar ? (
                            <img
                              src={task.employeeAvatar}
                              alt={task.employeeName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            task.employeeName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 text-xs sm:text-sm">
                            {task.employeeName}
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                            <span>{task.employeeCode}</span>
                            <span>•</span>
                            <span>{task.departmentName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {renderPriorityBadge(task.priority)}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-stone-700">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No deadline"}
                        </span>
                      </div>
                      {task.isOverdue && (
                        <span className="inline-block mt-0.5 text-[10px] text-rose-600 font-bold uppercase tracking-wider">
                          Overdue
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task, e.target.value as TaskItem["status"])
                        }
                        className="text-xs font-semibold bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-stone-800 focus:outline-none focus:border-[#00B050] cursor-pointer shadow-2xs"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-stone-600">
                      <div className="font-medium text-stone-900">{task.assignedByName}</div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                        {task.assignedByRole === "ORG_ADMIN" ? "Admin" : "Manager"}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setCompletionNotes(task.completionNotes || "");
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                setSelectedTask(task);
                setCompletionNotes(task.completionNotes || "");
                setIsDetailsModalOpen(true);
              }}
              className="anim-card p-5 rounded-3xl bg-white border border-stone-200/80 hover:border-stone-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {renderPriorityBadge(task.priority)}
                    {task.isOverdue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  {renderStatusBadge(task.status, task.isOverdue)}
                </div>

                <h3 className="font-bold text-base text-stone-900 group-hover:text-[#00B050] transition-colors mb-2 line-clamp-2">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="text-xs text-stone-500 line-clamp-3 mb-4 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 mt-auto">
                <div className="flex items-center justify-between text-xs text-stone-600 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-stone-700">
                      {task.employeeAvatar ? (
                        <img src={task.employeeAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        task.employeeName.charAt(0)
                      )}
                    </div>
                    <span className="text-stone-800 font-semibold">{task.employeeName}</span>
                  </div>

                  <span className="text-[11px] text-stone-400 font-medium">{task.departmentName}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due:{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "None"}
                  </span>

                  <span>By: {task.assignedByName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGN TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#00B050] border border-emerald-100">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Assign Task to Employee</h2>
                  <p className="text-xs text-stone-500">Designate deliverables and deadlines</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Select Employee */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Select Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#00B050] focus:ring-1 focus:ring-[#00B050] shadow-xs cursor-pointer"
                >
                  <option value="" disabled>Choose an employee ({employees.length} available)...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) — {emp.designation} [{emp.department}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audit monthly invoice discrepancies, Implement feature"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#00B050] focus:ring-1 focus:ring-[#00B050] shadow-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Instructions / Deliverable Criteria
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide detailed context, deliverables, guidelines, or instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#00B050] focus:ring-1 focus:ring-[#00B050] shadow-xs resize-none"
                />
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#00B050] focus:ring-1 focus:ring-[#00B050] shadow-xs cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Immediate Attention)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#00B050] focus:ring-1 focus:ring-[#00B050] shadow-xs"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#00B050] hover:bg-[#009b46] text-white shadow-md shadow-[#00B050]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <span>Assign Task</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK DETAILS MODAL */}
      {isDetailsModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 relative">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {renderPriorityBadge(selectedTask.priority)}
                  {renderStatusBadge(selectedTask.status, selectedTask.isOverdue)}
                </div>
                <h2 className="text-xl font-bold text-stone-900 leading-snug">{selectedTask.title}</h2>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Deliverable Description
                </span>
                <p className="text-sm text-stone-800 bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 leading-relaxed">
                  {selectedTask.description || "No specific instructions provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Assigned To
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-700">
                      {selectedTask.employeeAvatar ? (
                        <img src={selectedTask.employeeAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        selectedTask.employeeName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{selectedTask.employeeName}</div>
                      <div className="text-[11px] text-stone-500">{selectedTask.employeeCode} • {selectedTask.departmentName}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Assigned By
                  </span>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{selectedTask.assignedByName}</div>
                    <div className="text-[11px] text-stone-500 uppercase font-semibold">
                      {selectedTask.assignedByRole === "ORG_ADMIN" ? "Organization Admin" : "Team Manager"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Assigned Date</span>
                  <span className="text-stone-800 font-semibold">
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Due Date</span>
                  <span className={`font-semibold ${selectedTask.isOverdue ? "text-rose-600 font-bold" : "text-stone-800"}`}>
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "No Deadline"}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 col-span-2 sm:col-span-1">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Completion</span>
                  <span className="text-stone-800 font-semibold">
                    {selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleDateString() : "Pending"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Completion Notes / Deliverable Feedback
                </span>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Notes from assignee or manager on deliverables..."
                  className="w-full bg-white border border-stone-200 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#00B050] focus:ring-1 focus:ring-[#00B050] shadow-xs resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={async () => {
                    setUpdatingStatus(true);
                    try {
                      const res = await api.tasks.update(selectedTask.id, {
                        completionNotes: completionNotes.trim() || null,
                      });
                      if (res.success && res.data) {
                        setTasks((prev) =>
                          prev.map((t) => (t.id === selectedTask.id ? { ...t, ...res.data } : t))
                        );
                        setSelectedTask(res.data);
                        setIsDetailsModalOpen(false);
                      }
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setUpdatingStatus(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#00B050] hover:bg-[#009b46] text-white shadow-md shadow-[#00B050]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
