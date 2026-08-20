"use client";
import React, { useState } from 'react';
import { OrganizationsHeader } from '../Components/Organizations/OrganizationsHeader';
import { OrganizationFilters } from '../Components/Organizations/OrganizationFilters';
import { OrganizationTable, Organization } from '../Components/Organizations/OrganizationTable';
import { SuspensionNoticeCard } from '../Components/Organizations/SuspensionNoticeCard';
import { OrganizationDetailsModal } from '../Components/Organizations/OrganizationDetailsModal';
import { OrganizationEditModal } from '../Components/Organizations/OrganizationEditModal';
import { OrganizationDeleteModal } from '../Components/Organizations/OrganizationDeleteModal'; // ডিলিট মডাল ইমপোর্ট

const initialOrganizations: Organization[] = [
    { 
        id: 'ORG-1001', 
        name: 'Vertex Technologies Ltd.', 
        logo: '',
        category: 'Software & IT', 
        email: 'contact@vertextech.io', 
        phone: '+8801700000001', 
        website: 'https://vertextech.io', 
        address: 'Level 4, Uttara Tower, Dhaka', 
        country: 'Bangladesh', 
        language: 'English', 
        currency: 'BDT (৳)', 
        timeZone: 'GMT +6:00', 
        workingDays: 'Sun - Thu', 
        officeHours: '09:00 AM - 06:00 PM',
        plan: 'Business', 
        employees: 291, 
        branches: 4, 
        revenue: '$1,490', 
        joined: 'Jan 12, 2024', 
        status: 'Active', 
        initials: 'VT', 
        bg: 'bg-emerald-600' 
    },
    { 
        id: 'ORG-1002', 
        name: 'Bengal Textiles Ltd.', 
        logo: '',
        category: 'Manufacturing', 
        email: 'info@bengaltextiles.com', 
        phone: '+8801800000002', 
        website: 'https://bengaltextiles.com', 
        address: 'Industrial Area, Gazipur', 
        country: 'Bangladesh', 
        language: 'English', 
        currency: 'BDT (৳)', 
        timeZone: 'GMT +6:00', 
        workingDays: 'Sat - Thu', 
        officeHours: '08:00 AM - 05:00 PM',
        plan: 'Enterprise', 
        employees: 1240, 
        branches: 12, 
        revenue: '$3,990', 
        joined: 'Mar 02, 2024', 
        status: 'Active', 
        initials: 'BT', 
        bg: 'bg-amber-600' 
    },
    { 
        id: 'ORG-1003', 
        name: 'GreenMart Superstores', 
        logo: '',
        category: 'Retail', 
        email: 'support@greenmart.net', 
        phone: '+8801900000003', 
        website: 'https://greenmart.net', 
        address: 'Gulshan-2, Dhaka', 
        country: 'Bangladesh', 
        language: 'English', 
        currency: 'BDT (৳)', 
        timeZone: 'GMT +6:00', 
        workingDays: 'Mon - Sat', 
        officeHours: '10:00 AM - 08:00 PM',
        plan: 'Starter', 
        employees: 84, 
        branches: 3, 
        revenue: '$147', 
        joined: 'May 18, 2024', 
        status: 'Active', 
        initials: 'GS', 
        bg: 'bg-teal-600' 
    },
    { 
        id: 'ORG-1004', 
        name: 'CareMed Hospital', 
        logo: '',
        category: 'Healthcare', 
        email: 'help@caremed.org', 
        phone: '+8801500000004', 
        website: 'https://caremed.org', 
        address: 'Main Road, Sylhet', 
        country: 'Bangladesh', 
        language: 'English', 
        currency: 'BDT (৳)', 
        timeZone: 'GMT +6:00', 
        workingDays: 'Sun - Sat (24/7)', 
        officeHours: '24 Hours',
        plan: 'Business', 
        employees: 460, 
        branches: 2, 
        revenue: '$298', 
        joined: 'Jul 07, 2024', 
        status: 'Active', 
        initials: 'CH', 
        bg: 'bg-indigo-600' 
    },
    { 
        id: 'ORG-1005', 
        name: 'SkillPoint Academy', 
        logo: '',
        category: 'Education', 
        email: 'contact@skillpoint.edu', 
        phone: '+8801600000005', 
        website: 'https://skillpoint.edu', 
        address: 'Habiganj Sadar, Habiganj', 
        country: 'Bangladesh', 
        language: 'English', 
        currency: 'BDT (৳)', 
        timeZone: 'GMT +6:00', 
        workingDays: 'Sun - Thu', 
        officeHours: '09:00 AM - 05:00 PM',
        plan: 'Free', 
        employees: 18, 
        branches: 1, 
        revenue: '$0', 
        joined: 'Aug 01, 2026', 
        status: 'Trial', 
        initials: 'SA', 
        bg: 'bg-gray-500' 
    },
    { 
        id: 'ORG-1006', 
        name: 'Delta Logistics', 
        logo: '',
        category: 'Logistics', 
        email: 'ops@deltalogistics.com', 
        phone: '+8801300000006', 
        website: 'https://deltalogistics.com', 
        address: 'Agrabad C/O, Chattogram', 
        country: 'Bangladesh', 
        language: 'English', 
        currency: 'BDT (৳)', 
        timeZone: 'GMT +6:00', 
        workingDays: 'Sat - Thu', 
        officeHours: '09:00 AM - 07:00 PM',
        plan: 'Business', 
        employees: 318, 
        branches: 9, 
        revenue: '$596', 
        joined: 'Feb 14, 2024', 
        status: 'Active', 
        initials: 'DL', 
        bg: 'bg-blue-600' 
    },
    { 
        id: 'ORG-1007', 
        name: 'UrbanNest Realty', 
        logo: '',
        category: 'Real Estate', 
        email: 'info@urbannest.com', 
        phone: '+8801400000007', 
        website: 'https://urbannest.com', 
        address: 'Banani, Dhaka', 
        country: 'Bangladesh', 
        language: 'English', 
        currency: 'BDT (৳)', 
        timeZone: 'GMT +6:00', 
        workingDays: 'Sun - Thu', 
        officeHours: '10:00 AM - 06:00 PM',
        plan: 'Starter', 
        employees: 55, 
        branches: 2, 
        revenue: '$0', 
        joined: 'Sep 22, 2024', 
        status: 'Suspended', 
        initials: 'UR', 
        bg: 'bg-rose-600' 
    },
];

export const OrganizationsPage = () => {
    const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('All');
    
    // Modal States
    const [selectedOrgForDetails, setSelectedOrgForDetails] = useState<Organization | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const [selectedOrgForEdit, setSelectedOrgForEdit] = useState<Organization | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [selectedOrgForDelete, setSelectedOrgForDelete] = useState<Organization | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Action Handlers
    const handleView = (org: Organization) => {
        setSelectedOrgForDetails(org);
        setIsDetailsModalOpen(true);
    };

    const handleEdit = (org: Organization) => {
        setSelectedOrgForEdit(org);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedOrg: Organization) => {
        setOrganizations(prev => 
            prev.map(item => item.id === updatedOrg.id ? updatedOrg : item)
        );
        setIsEditModalOpen(false);
        setSelectedOrgForEdit(null);
    };

    const handleToggleStatus = (org: Organization) => {
        setOrganizations(prev => 
            prev.map(item => {
                if (item.id === org.id) {
                    const newStatus = item.status === 'Suspended' ? 'Active' : 'Suspended';
                    return { ...item, status: newStatus };
                }
                return item;
            })
        );
    };

    // Delete Handlers
    const handleDelete = (org: Organization) => {
        setSelectedOrgForDelete(org);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = (org: Organization) => {
        setOrganizations(prev => prev.filter(item => item.id !== org.id));
        setIsDeleteModalOpen(false);
        setSelectedOrgForDelete(null);
    };

    // Filter Logic for Search & Plan Dropdown
    const filteredOrganizations = organizations.filter(org => {
        const matchesSearch = 
            org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            org.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPlan = selectedPlan === 'All' || org.plan === selectedPlan;

        return matchesSearch && matchesPlan;
    });

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 min-h-screen bg-[#FDFBF7]">
            {/* Header Component */}
            <OrganizationsHeader 
                totalShown={filteredOrganizations.length} 
                totalCount={organizations.length} 
            />

            {/* Filters Component */}
            <OrganizationFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
            />

            {/* Table Component with Action Handlers */}
            <OrganizationTable 
                organizations={filteredOrganizations} 
                onView={handleView}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
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