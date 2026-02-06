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
    const [saving, setSaving] = useState(false);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string | number; username: string } | null>(null);

    const isAdmin = currentUser?.role === 'admin';

    const resetForm = () => {
        setFormData({ username: '', full_name: '', password: '', role: '' });
        setEditingId(null);
        setError('');
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

    const handleSubmit = async () => {
        if (!formData.username || !formData.full_name || !formData.role) {
            setError('Username, Name, and Role are required');
            return;
        }
        if (!editingId && !formData.password) {
            setError('Password is required for new users');
            return;
        }

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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Users</CardTitle>
                    {isAdmin && (
                        <Dialog open={open} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm}>Add User</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingId ? 'Edit User' : 'Add User'}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {error && <div className="text-red-500 text-sm">{error}</div>}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <Input
                                                id="username"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                disabled={!!editingId} // Usually username is immutable or hard to change
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fullname">Full Name *</Label>
                                            <Input id="fullname" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password {editingId && '(leave blank to keep)'}</Label>
                                            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role *</Label>
                                            <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
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
                                    <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update User' : 'Create User')}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
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
                                                <Button variant="ghost" size="icon" onClick={() => startEdit(u)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => openDeleteDialog(u)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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

