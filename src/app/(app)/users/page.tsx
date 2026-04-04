
'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users as allUsers, payments, shifts, roleDisplayNames, roleBadgeColors } from "@/lib/data";
import type { User, UserRole } from '@/types';
import { ArrowLeft, FileDown, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { UserProfileCard } from '@/components/app/dashboard/user-profile-card';

export default function UsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userRoleFilter = searchParams.get('userRoleFilter') as UserRole | null;
    const statusFilter = searchParams.get('statusFilter');
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

    const { filteredUsers, listTitle } = React.useMemo(() => {
        if (!userRoleFilter) {
            return { filteredUsers: allUsers, listTitle: 'All Users' };
        }

        let newTitle = '';
        let filtered = allUsers.filter(u => u.role === userRoleFilter);
        const roleName = roleDisplayNames[userRoleFilter] || userRoleFilter;

        switch (statusFilter) {
            case 'withDues':
                filtered = filtered.filter(u => payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue')));
                newTitle = `${roleName} with Dues`;
                break;
            case 'noDues':
                filtered = filtered.filter(u => !payments.some(p => p.userId === u.id && (p.status === 'Due' || p.status === 'Overdue')));
                newTitle = `${roleName} with No Dues`;
                break;
            case 'active':
                filtered = filtered.filter(u => shifts.some(s => s.personnel === u.name && s.status === 'Active'));
                 newTitle = `Active ${roleName}`;
                break;
            case 'inactive':
                filtered = filtered.filter(u => !shifts.some(s => s.personnel === u.name && s.status === 'Active'));
                newTitle = `Inactive ${roleName}`;
                break;
            case 'all':
            default:
                newTitle = `All ${roleName}`;
                break;
        }

        return { filteredUsers: filtered, listTitle: newTitle };
    }, [userRoleFilter, statusFilter]);

    const handleExportCsv = () => {
        const headers = ['id', 'name', 'email', 'phone', 'role', 'unit', 'sqft', 'service', 'shift'];
        const csvRows = [headers.join(',')];

        filteredUsers.forEach(user => {
            const row = [ user.id, user.name, user.email, user.phone || '', user.role, user.details?.unit || '', user.details?.sqft || '', user.details?.service || '', user.details?.shift || '' ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${listTitle.toLowerCase().replace(/ /g, '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    if (selectedUser) {
        return (
            <div>
                 <Button variant="outline" onClick={() => setSelectedUser(null)} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to List
                </Button>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <UserProfileCard user={selectedUser} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/dashboard?role=Admin')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">{listTitle}</h1>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Details</CardTitle>
                    <Button variant="outline" size="icon" onClick={handleExportCsv}>
                        <FileDown className="h-4 w-4" />
                        <span className="sr-only">Export as CSV</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                {userRoleFilter === 'Apartment' && <TableHead>Size (sqft)</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u, index) => (
                                <TableRow key={u.id} className={cn("cursor-pointer", index % 2 === 0 && "bg-muted/50")} onClick={() => setSelectedUser(u)}>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell><Badge variant="outline" className={cn(roleBadgeColors[u.role])}>{roleDisplayNames[u.role]}</Badge></TableCell>
                                    <TableCell>
                                        <a href={`mailto:${u.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-primary hover:underline">
                                            <Mail className="h-4 w-4" />
                                            <span>Email</span>
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {u.phone ? (
                                            <a href={`tel:${u.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-primary hover:underline">
                                                <Phone className="h-4 w-4" />
                                                <span>Call</span>
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>
                                    {userRoleFilter === 'Apartment' && <TableCell>{u.details?.sqft}</TableCell>}
                                </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={userRoleFilter === 'Apartment' ? 5 : 4} className="text-center text-muted-foreground py-4">No users found for this filter.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
