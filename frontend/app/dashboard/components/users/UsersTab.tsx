'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUser } from '@/lib/api';

interface UsersTabProps {
    data: any;
    loading: boolean;
    loadSection?: (sec: string) => void;
}

export default function UsersTab({ data, loading, loadSection }: UsersTabProps) {
    const users = Array.isArray(data) ? data : [];
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ username: '', full_name: '', password: '', role: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!formData.username || !formData.full_name || !formData.password || !formData.role) {
            setError('All fields are required');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await createUser(formData);
            if (res.success) {
                setOpen(false);
                setFormData({ username: '', full_name: '', password: '', role: '' });
                if (loadSection) loadSection('users');
            } else {
                setError(res.error || 'Failed to create user');
            }
        } catch {
            setError('An error occurred');
        }
        setSaving(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Users</CardTitle>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add User</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add User</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username *</Label>
                                    <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullname">Full Name *</Label>
                                    <Input id="fullname" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Select onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                            <SelectItem value="floor">Floor</SelectItem>
                                            <SelectItem value="account">Account</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create User'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-muted-foreground">Loading...</div>
                ) : users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No users found.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u: any) => (
                                <TableRow key={u.id ?? u.username}>
                                    <TableCell className="font-semibold">{u.username}</TableCell>
                                    <TableCell>{u.full_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{u.role}</Badge>
                                    </TableCell>
                                    <TableCell>{u.status ?? 'active'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
