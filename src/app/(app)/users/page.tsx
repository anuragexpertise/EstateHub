
'use client';
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users as allUsers, payments, shifts, roleDisplayNames, roleBadgeVariants } from "@/lib/data";
import type { User, UserRole } from '@/types';
import { ArrowLeft, FileDown, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserProfileCard } from '@/components/app/dashboard/user-profile-card';

export default function UsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as UserRole | null;
    const userRoleFilter = searchParams.get('userRoleFilter') as UserRole | null;
    const statusFilter = searchParams.get('statusFilter');
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

    const isAdmin = role === 'Admin';

    const { filteredUsers, listTitle } = React.useMemo(() => {
        let defaultTitle = isAdmin ? 'All Users' : 'User Directory';
        let usersToFilter = isAdmin ? allUsers : allUsers.filter(u => u.role === userRoleFilter);

        if (!userRoleFilter) {
            return { filteredUsers: isAdmin ? allUsers : [], listTitle: defaultTitle };
        }

        let newTitle = '';
        let filtered = allUsers.filter(u => u.role === userRoleFilter);
        const roleName = roleDisplayNames[userRoleFilter] || userRoleFilter;

        if(isAdmin) {
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
        } else {
            newTitle = `All ${roleName}`;
        }


        return { filteredUsers: filtered, listTitle: newTitle };
    }, [userRoleFilter, statusFilter, isAdmin]);

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
    
    if (selectedUser && isAdmin) {
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
                <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard?role=${role}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">{listTitle}</h1>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Directory</CardTitle>
                    {isAdmin && (
                        <Button variant="outline" size="icon" onClick={handleExportCsv}>
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">Export as CSV</span>
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                {userRoleFilter === 'Apartment' && <TableHead>Unit</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u, index) => (
                                <TableRow key={u.id} className={cn("whitespace-normal break-words", index % 2 === 0 && "bg-muted/50", isAdmin && "cursor-pointer")} onClick={() => isAdmin && setSelectedUser(u)}>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant={roleBadgeVariants[u.role]}>{roleDisplayNames[u.role]}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <a href={`mailto:${u.email}`} onClick={e => isAdmin && e.stopPropagation()} className="flex items-center gap-2 text-primary hover:underline">
                                            <Mail className="h-4 w-4" />
                                            <span className="hidden md:inline break-all">{u.email}</span>
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {u.phone ? (
                                            <a href={`tel:${u.phone}`} onClick={e => isAdmin && e.stopPropagation()} className="flex items-center gap-2 text-primary hover:underline">
                                                <Phone className="h-4 w-4" />
                                                <span className="hidden md:inline whitespace-normal break-words">{u.phone}</span>
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>
                                    {userRoleFilter === 'Apartment' && <TableCell>{u.details?.unit}</TableCell>}
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
