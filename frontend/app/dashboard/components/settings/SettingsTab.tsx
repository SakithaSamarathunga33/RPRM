'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateSettings } from '@/lib/api';

interface SettingsTabProps {
    data: any;
    loading: boolean;
    loadSection?: (sec: string) => void;
}

export default function SettingsTab({ data, loading, loadSection }: SettingsTabProps) {
    const [formData, setFormData] = useState({
        casino_name: '',
        poker_room_name: '',
        operator_company: '',
        casino_share_percent: 50,
        session_timeout_minutes: 30,
    });
    const [saving, setSaving] = useState(false);

    // Initialize form with existing settings
    useEffect(() => {
        if (data) {
            setFormData({
                casino_name: data.casino_name || '',
                poker_room_name: data.poker_room_name || '',
                operator_company: data.operator_company || '',
                casino_share_percent: data.casino_share_percent ?? 50,
                session_timeout_minutes: data.session_timeout_minutes ?? 30,
            });
        }
    }, [data]);

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateSettings({
                casino_name: formData.casino_name,
                poker_room_name: formData.poker_room_name,
                operator_company: formData.operator_company,
                casino_share_percent: Number(formData.casino_share_percent),
                session_timeout_minutes: Number(formData.session_timeout_minutes),
            });

            if (res.success) {
                toast.success('Settings saved successfully');
                if (loadSection) loadSection('settings');
            } else {
                toast.error(res.error || 'Failed to save settings');
            }
        } catch {
            toast.error('Error saving settings');
        }
        setSaving(false);
    };

    return (
        <section className="bg-slate-50 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-primary">Settings</h2>
            </div>

            {loading ? (
                <div className="text-muted-foreground">Loading...</div>
            ) : (
                <div className="space-y-5 max-w-2xl">
                    {/* Casino Name */}
                    <div className="space-y-2">
                        <Label htmlFor="casino_name" className="text-sm font-medium text-amber-700">
                            Casino Name
                        </Label>
                        <Input
                            id="casino_name"
                            value={formData.casino_name}
                            onChange={(e) => handleChange('casino_name', e.target.value)}
                            placeholder="Enter casino name"
                            className="bg-white"
                        />
                    </div>

                    {/* Poker Room Name */}
                    <div className="space-y-2">
                        <Label htmlFor="poker_room_name" className="text-sm font-medium text-amber-700">
                            Poker Room Name
                        </Label>
                        <Input
                            id="poker_room_name"
                            value={formData.poker_room_name}
                            onChange={(e) => handleChange('poker_room_name', e.target.value)}
                            placeholder="Enter poker room name"
                            className="bg-white"
                        />
                    </div>

                    {/* Operator Company */}
                    <div className="space-y-2">
                        <Label htmlFor="operator_company" className="text-sm font-medium text-amber-700">
                            Operator Company
                        </Label>
                        <Input
                            id="operator_company"
                            value={formData.operator_company}
                            onChange={(e) => handleChange('operator_company', e.target.value)}
                            placeholder="Enter operator company"
                            className="bg-white"
                        />
                    </div>

                    {/* Casino Share % and Session Timeout side by side */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="casino_share_percent" className="text-sm font-medium text-amber-700">
                                Casino Share %
                            </Label>
                            <Input
                                id="casino_share_percent"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.casino_share_percent}
                                onChange={(e) => handleChange('casino_share_percent', e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="session_timeout_minutes" className="text-sm font-medium text-amber-700">
                                Session Timeout (min)
                            </Label>
                            <Input
                                id="session_timeout_minutes"
                                type="number"
                                min="1"
                                max="1440"
                                value={formData.session_timeout_minutes}
                                onChange={(e) => handleChange('session_timeout_minutes', e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}
