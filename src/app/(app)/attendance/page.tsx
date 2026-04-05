
'use client';
import { AttendanceRelayCard } from '@/components/app/kpi-cards/attendance-card';
import { PersonnelCard } from '@/components/app/kpi-cards/personnel-card';

export default function AttendancePage() {
    return (
        <div className="grid gap-6">
            <AttendanceRelayCard />
            <PersonnelCard />
        </div>
    );
}

    