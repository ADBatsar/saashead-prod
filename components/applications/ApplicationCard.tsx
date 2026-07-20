"use client";

import VendorBadge from "@/components/workspace/VendorBadge";
import { HealthDot } from "@/components/workspace/StatusChip";

import {
    Pencil,
    Trash2,
} from "lucide-react";

import type { Application } from "@/types/application";

import {
    currency,
    formatDate,
} from "@/lib/utils";

interface ApplicationCardProps {
    application: Application;
    onEdit: (application: Application) => void;
    onDelete: (id: string) => void;
}

const HEALTH_LABEL = {
    healthy: "Healthy",
    underutilized: "Underutilized",
    waste: "Waste",
};

export default function ApplicationCard({
    application,
    onEdit,
    onDelete,
}: ApplicationCardProps) {

    const usage =
        application.seats_total > 0
            ? Math.round(
                  (application.seats_used /
                      application.seats_total) *
                      100
              )
            : 0;

    const color =
        application.health === "healthy"
            ? "bg-emerald-400"
            : application.health === "underutilized"
            ? "bg-amber-400"
            : "bg-rose-400";

    return (

        <div className="relative rounded-2xl border border-slate-800/80 bg-[#0E1320]/80 hover:bg-[#101729] transition duration-300 p-5 overflow-hidden group">

            <span
                className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full shadow-[0_0_12px] ${color}`}
            />

            <div className="flex items-center gap-3">

                <VendorBadge
                    name={application.vendor}
                    size={42}
                />

                <div className="min-w-0 flex-1">

                    <h3 className="text-white font-medium truncate">

                        {application.name}

                    </h3>

                    <p className="text-[11px] text-slate-500 truncate">

                        {application.vendor} • {application.category}

                    </p>

                </div>

            </div>

            {/* Seat Usage */}

            <div className="mt-5">

                <div className="flex items-center justify-between text-[11px] text-slate-500">

                    <span>

                        Seats Used

                    </span>

                    <span className="tabular-nums text-slate-300">

                        {application.seats_used} / {application.seats_total}

                    </span>

                </div>

                <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">

                    <div
                        className={`h-full ${color} transition-all duration-500`}
                        style={{
                            width: `${Math.min(
                                usage,
                                100
                            )}%`,
                        }}
                    />

                </div>

            </div>

            {/* Information */}

            <div className="grid grid-cols-2 gap-4 mt-5 text-xs">

                <Info
                    label="Monthly Cost"
                    value={currency(application.monthly_cost)}
                />

                <Info
                    label="Renewal"
                    value={formatDate(
                        application.renewal_date
                    )}
                />

                <Info
                    label="Owner"
                    value={application.department}
                />

                <div>

                    <div className="text-slate-500">

                        Status

                    </div>

                    <div className="mt-1 flex items-center gap-1.5">

                        <HealthDot
                            health={application.health}
                        />

                        <span className="text-slate-300">

                            {
                                HEALTH_LABEL[
                                    application.health
                                ]
                            }

                        </span>

                    </div>

                </div>

            </div>

            {/* Actions */}

            <div className="mt-5 flex gap-2">

                <button
                    onClick={() =>
                        onEdit(application)
                    }
                    className="flex-1 rounded-lg bg-white/5 hover:bg-white/10 transition py-2 text-xs text-slate-300 flex items-center justify-center gap-2"
                >

                    <Pencil className="w-3.5 h-3.5" />

                    Edit

                </button>

                <button
                    onClick={() =>
                        onDelete(application.id)
                    }
                    className="rounded-lg bg-rose-500/5 hover:bg-rose-500/15 transition px-3 text-rose-400"
                >

                    <Trash2 className="w-3.5 h-3.5" />

                </button>

            </div>

        </div>

    );

}

interface InfoProps {
    label: string;
    value: string | number;
}

function Info({
    label,
    value,
}: InfoProps) {

    return (

        <div>

            <div className="text-slate-500">

                {label}

            </div>

            <div className="mt-1 text-sm text-white">

                {value}

            </div>

        </div>

    );

}
