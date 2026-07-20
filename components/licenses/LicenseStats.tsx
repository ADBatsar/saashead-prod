"use client";

import KpiCard from "@/components/workspace/KpiCard";
import {
    Package,
    Users,
    UserX,
    DollarSign,
} from "lucide-react";

import { currency } from "@/lib/utils";

interface Props {
    licenses: {
        licenseCount: number;
        assignedUsers: number;
        costPerLicense: number;
    }[];
}

export default function LicenseStats({
    licenses,
}: Props) {

    const totalApplications =
        licenses.length;

    const totalLicenses =
        licenses.reduce(
            (sum, l) =>
                sum + l.licenseCount,
            0
        );

    const assigned =
        licenses.reduce(
            (sum, l) =>
                sum + l.assignedUsers,
            0
        );

    const unused =
        Math.max(
            0,
            totalLicenses - assigned
        );

    const monthlySpend =
        licenses.reduce(
            (sum, l) =>
                sum +
                l.costPerLicense *
                    l.licenseCount,
            0
        );

    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

            <KpiCard
                label="Applications"
                value={totalApplications}
                accent="blue"
                icon={Package}
            />

            <KpiCard
                label="Total Licenses"
                value={totalLicenses}
                accent="emerald"
                icon={Users}
            />

            <KpiCard
                label="Unused"
                value={unused}
                accent="rose"
                icon={UserX}
            />

            <KpiCard
                label="Monthly Spend"
                value={currency(monthlySpend)}
                accent="amber"
                icon={DollarSign}
            />

        </div>

    );

}
