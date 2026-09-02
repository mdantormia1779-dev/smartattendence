"use client";
import React, { useState, useEffect } from 'react';
import { OrganizationsHeader } from '../Components/Organizations/OrganizationsHeader';
import { OrganizationFilters } from '../Components/Organizations/OrganizationFilters';
import { OrganizationTable, Organization } from '../Components/Organizations/OrganizationTable';
import { SuspensionNoticeCard } from '../Components/Organizations/SuspensionNoticeCard';
import { OrganizationDetailsModal } from '../Components/Organizations/OrganizationDetailsModal';
import { OrganizationEditModal } from '../Components/Organizations/OrganizationEditModal';
import { OrganizationDeleteModal } from '../Components/Organizations/OrganizationDeleteModal';
import { OrganizationCreateModal } from '../Components/Organizations/OrganizationCreateModal';
import { api } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export const OrganizationsPage = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('All');
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [selectedOrgForDetails, setSelectedOrgForDetails] = useState<Organization | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [selectedOrgForEdit, setSelectedOrgForEdit] = useState<Organization | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [selectedOrgForDelete, setSelectedOrgForDelete] = useState<Organization | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const res = await api.organizations.getAll();
            if (res.success && Array.isArray(res.data)) {
                const colors = ['bg-emerald-600', 'bg-amber-600', 'bg-teal-600', 'bg-indigo-600', 'bg-blue-600', 'bg-rose-600', 'bg-purple-600'];
                const mapped: Organization[] = res.data.map((o: any, idx: number) => {
                    const initials = (o.name || 'Org')
                        .split(' ')
                        .map((w: string) => w[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                    let status = o.isSuspended ? 'Suspended' : (o.subscriptionStatus === 'TRIAL' ? 'Trial' : 'Active');
                    if (o.status) status = o.status;

                    return {
                        id: o.id,
                        name: o.name || 'Untitled Organization',
                        logo: o.customLogoUrl || '',
                        category: o.industry || 'General',
                        email: o.email || '',
                        phone: o.phone || '',
                        website: o.website || (o.customDomain ? `https://${o.customDomain}` : ''),
                        address: o.address || '',
                        country: o.country || 'Bangladesh',
                        language: o.language || 'English',
                        currency: o.currency || 'BDT (৳)',
                        timeZone: o.timezone || 'GMT +6:00',
                        workingDays: Array.isArray(o.workingDays) ? o.workingDays.join(', ') : (o.workingDays || 'Sun - Thu'),
                        officeHours: `${o.defaultOfficeStart || '09:00 AM'} - ${o.defaultOfficeEnd || '05:00 PM'}`,
                        plan: o.planName || (o.planTier ? (o.planTier === 'FREE' ? '30-Day Free Trial' : o.planTier.charAt(0) + o.planTier.slice(1).toLowerCase() + ' Plan') : 'Starter Plan'),
                        planName: o.planName || undefined,
                        planTier: o.planTier || undefined,
                        // Fix: Preserve 0 count using nullish coalescing instead of treating 0 as falsy
                        employees: o.totalEmployees ?? 0,
                        branches: o.totalBranches ?? 0,
                        revenue: '$149',
                        joined: o.createdAt ? o.createdAt.split('T')[0] : '',
                        status: status,
                        initials: initials,
                        bg: colors[idx % colors.length]
                    };
                });
                setOrganizations(mapped);
            }
        } catch (err) {
            console.error('Failed to load organizations', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    // Create Handler
    const handleSaveCreate = async (newOrgData: any) => {
        const res = await api.organizations.create(newOrgData);
        if (!res.success) {
            throw new Error(res.message || 'Failed to create organization');
        }
        await fetchOrganizations();
    };

    // Action Handlers
    const handleView = (org: Organization) => {
        setSelectedOrgForDetails(org);
        setIsDetailsModalOpen(true);
    };

    const handleEdit = (org: Organization) => {
        setSelectedOrgForEdit(org);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedOrg: Organization) => {
        try {
            const start = updatedOrg.officeHours ? updatedOrg.officeHours.split(' - ')[0] : '09:00 AM';
            const end = updatedOrg.officeHours ? updatedOrg.officeHours.split(' - ')[1] : '05:00 PM';

            await api.organizations.update(updatedOrg.id, {
                name: updatedOrg.name,
                industry: updatedOrg.category,
                email: updatedOrg.email,
                phone: updatedOrg.phone,
                website: updatedOrg.website,
                address: updatedOrg.address,
                country: updatedOrg.country,
                language: updatedOrg.language,
                currency: updatedOrg.currency,
                timezone: updatedOrg.timeZone,
                workingDays: updatedOrg.workingDays,
                planTier: (updatedOrg.plan.toUpperCase()) as any,
                customLogoUrl: updatedOrg.logo || null,
                defaultOfficeStart: start,
                defaultOfficeEnd: end,
                brandColor: '#00B050',
                adminPassword: updatedOrg.adminPassword || undefined,
            });
            await fetchOrganizations();
        } catch (err) {
            console.error('Failed to update organization', err);
        } finally {
            setIsEditModalOpen(false);
            setSelectedOrgForEdit(null);
        }
    };

    const handleToggleStatus = async (org: Organization) => {
        try {
            const isSuspended = org.status !== 'Suspended';
            await api.organizations.update(org.id, {
                isSuspended,
                suspensionReason: isSuspended ? 'Suspended by Super Admin' : null,
            });
            await fetchOrganizations();
        } catch (err) {
            console.error('Failed to toggle organization status', err);
        }
    };

    // Delete Handlers
    const handleDelete = (org: Organization) => {
        setSelectedOrgForDelete(org);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (org: Organization) => {
        try {
            await api.organizations.delete(org.id);
            await fetchOrganizations();
        } catch (err) {
            console.error('Failed to delete organization', err);
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedOrgForDelete(null);
        }
    };

    // Filter Logic for Search & Plan Dropdown
    const filteredOrganizations = organizations.filter(org => {
        const matchesSearch = 
            org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            org.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPlan = 
            selectedPlan === 'All' || 
            org.plan.toLowerCase().includes(selectedPlan.toLowerCase()) || 
            selectedPlan.toLowerCase().includes(org.plan.toLowerCase()) ||
            (org.planTier && org.planTier.toLowerCase() === selectedPlan.toLowerCase()) ||
            (org.planName && org.planName.toLowerCase().includes(selectedPlan.toLowerCase()));

        return matchesSearch && matchesPlan;
    });

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 min-h-screen bg-[#FBFBFA]">
            {/* Header Component */}
            <OrganizationsHeader 
                totalShown={filteredOrganizations.length} 
                totalCount={organizations.length}
                onCreateClick={() => setIsCreateModalOpen(true)}
            />

            {/* Filters Component */}
            <OrganizationFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
            />

            {/* Table Component with Action Handlers */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-[#00B050] mb-2" />
                    <span className="text-xs font-semibold">Loading organizations from database...</span>
                </div>
            ) : (
                <OrganizationTable 
                    organizations={filteredOrganizations} 
                    onView={handleView}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                />
            )}

            {/* Organization Create Modal */}
            <OrganizationCreateModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveCreate}
            />

            {/* Organization Details Modal */}
            <OrganizationDetailsModal 
                organization={selectedOrgForDetails}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />

            {/* Organization Edit Modal */}
            <OrganizationEditModal 
                organization={selectedOrgForEdit}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEdit}
            />

            {/* Organization Delete Confirmation Modal */}
            <OrganizationDeleteModal 
                organization={selectedOrgForDelete}
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />

            {/* Bottom Notice Component */}
            <SuspensionNoticeCard />
        </div>
    );
};

export default OrganizationsPage;