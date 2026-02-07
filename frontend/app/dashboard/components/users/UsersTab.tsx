'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUser, updateUser, deleteUser } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

interface UsersTabProps {
    data: any;
    loading: boolean;
    loadSection?: (sec: string) => void;
    currentUser?: { role: string };
}

export default function UsersTab({ data, loading, loadSection, currentUser }: UsersTabProps) {
    const users = Array.isArray(data) ? data : [];
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ username: '', full_name: '', password: '', role: '' });
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string | number; username: string } | null>(null);

    const isAdmin = currentUser?.role === 'admin';

    const resetForm = () => {
        setFormData({ username: '', full_name: '', password: '', role: '' });
        setEditingId(null);
        setError('');
        setFieldErrors({});
    };

    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        if (!val) resetForm();
    };

    const startEdit = (user: any) => {
        setEditingId(user.id || user._id);
        setFormData({
            username: user.username,
            full_name: user.full_name,
            password: '', // Leave empty to keep unchanged
            role: user.role
        });
        setOpen(true);
    };

    const openDeleteDialog = (user: any) => {
        setUserToDelete({ id: user.id ?? user._id, username: user.username });
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        setSaving(true);
        try {
            const res = await deleteUser(userToDelete.id);
            if (res.success) {
                toast.success('User deleted successfully');
                if (loadSection) loadSection('users');
            } else {
                toast.error(res.error || 'Failed to delete user');
            }
        } catch {
            toast.error('Error deleting user');
        }
        setSaving(false);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.full_name.trim()) newErrors.full_name = 'Full Name is required';
        if (!formData.role) newErrors.role = 'Role is required';

        if (!editingId && !formData.password) {
            newErrors.password = 'Password is required for new users';
        }

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setSaving(true);
        setError('');
        try {
            let res;
            if (editingId) {
                res = await updateUser(editingId, formData);
            } else {
                res = await createUser(formData);
            }

            if (res.success) {
                toast.success(editingId ? 'User updated successfully' : 'User created successfully');
                setOpen(false);
                resetForm();
                if (loadSection) loadSection('users');
            } else {
                setError(res.error || 'Operation failed');
            }
        } catch {
            setError('An error occurred');
        }
        setSaving(false);
    };

    return (
        <>
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Users</CardTitle>
                    {isAdmin && (
                        <Dialog open={open} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm} className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation">Add User</Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[95vh] overflow-y-auto w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>{editingId ? 'Edit User' : 'Add User'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <Input
                                                id="username"
                                                value={formData.username}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, username: e.target.value });
                                                    if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' });
                                                }}
                                                disabled={!!editingId}
                                                className={cn(fieldErrors.username ? 'border-red-500' : '', 'min-h-[44px] sm:min-h-0 text-base sm:text-sm touch-manipulation')}
                                            />
                                            {fieldErrors.username && <p className="text-xs text-red-500">{fieldErrors.username}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fullname">Full Name *</Label>
                                            <Input
                                                id="fullname"
                                                value={formData.full_name}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, full_name: e.target.value });
                                                    if (fieldErrors.full_name) setFieldErrors({ ...fieldErrors, full_name: '' });
                                                }}
                                                className={cn(fieldErrors.full_name ? 'border-red-500' : '', 'min-h-[44px] sm:min-h-0 text-base sm:text-sm touch-manipulation')}
                                            />
                                            {fieldErrors.full_name && <p className="text-xs text-red-500">{fieldErrors.full_name}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password {editingId && '(leave blank to keep)'}</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, password: e.target.value });
                                                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                                                }}
                                                className={cn(fieldErrors.password ? 'border-red-500' : '', 'min-h-[44px] sm:min-h-0 text-base sm:text-sm touch-manipulation')}
                                            />
                                            {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role *</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={(val) => {
                                                    setFormData({ ...formData, role: val });
                                                    if (fieldErrors.role) setFieldErrors({ ...fieldErrors, role: '' });
                                                }}
                                            >
                                                <SelectTrigger className={cn(fieldErrors.role ? 'border-red-500' : '', 'min-h-[44px] sm:min-h-0 text-base sm:text-sm touch-manipulation')}>
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
                                            {fieldErrors.role && <p className="text-xs text-red-500">{fieldErrors.role}</p>}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                                    <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation">Cancel</Button>
                                    <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation">{saving ? 'Saving...' : (editingId ? 'Update User' : 'Create User')}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {loading ? (
                        <div className="text-muted-foreground">Loading...</div>
                    ) : users.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">No users found.</p>
                    ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
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
                                        {isAdmin && (
                                            <TableCell className="text-right gap-2 flex justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => startEdit(u)} className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-manipulation" onClick={() => openDeleteDialog(u)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the user &quot;{userToDelete?.username}&quot;?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={saving}
                            variant="destructive"
                        >
                            {saving ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

