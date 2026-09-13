"use client";

import React, { useState } from "react";
import Layout from "@/components/workspace/Layout";
import { Mail, MessageSquare, BellRing, Phone, ShieldCheck, Clock } from "lucide-react";

export default function NotificationsPage() {
  // Mock states for the toggle switches
  const [alerts, setAlerts] = useState({
    email: true,
    slack: false,
    pagerDuty: true,
    whatsapp: true,
    sms: false
  });

  const toggle = (key: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Layout 
      title="Notifications & Security" 
      subtitle="Choose how & where you want SaaS alerts"
    >
      <div className="max-w-4xl space-y-6">
        
        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <AlertCard 
            icon={Mail} title="Email" subtitle="Daily/weekly summary email" 
            active={alerts.email} onClick={() => toggle('email')} 
          />
          <AlertCard 
            icon={MessageSquare} title="Slack" subtitle="Post to a Slack channel via webhook" 
            active={alerts.slack} onClick={() => toggle('slack')} 
          />
          <AlertCard 
            icon={BellRing} title="PagerDuty" subtitle="Page on-call when license risk is critical" 
            active={alerts.pagerDuty} onClick={() => toggle('pagerDuty')} 
          />
          <AlertCard 
            icon={Phone} title="WhatsApp" subtitle="WhatsApp via Twilio" 
            active={alerts.whatsapp} onClick={() => toggle('whatsapp')} 
          />
          <AlertCard 
            icon={MessageSquare} title="SMS" subtitle="SMS via Twilio" 
            active={alerts.sms} onClick={() => toggle('sms')} 
          />
          
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900">Summary schedule</h3>
            </div>
            <p className="text-sm text-slate-500 italic">Configuration form pending integration...</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-slate-900">Multi-Factor Authentication</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Add an extra layer of security with any authenticator app.</p>
            <button disabled className="bg-slate-100 text-slate-400 font-medium px-4 py-2 rounded-lg text-sm cursor-not-allowed border border-slate-200">
              Enable MFA
            </button>
          </div>

        </div>

      </div>
    </Layout>
  );
}

// Helper component for the toggle cards
function AlertCard({ icon: Icon, title, subtitle, active, onClick }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      
      {/* Custom Toggle Switch */}
      <button 
        onClick={onClick}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          active ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <span 
          className={`inline-block w-5 h-5 transform bg-white rounded-full transition duration-200 ease-in-out mt-0.5 ml-0.5 shadow-sm ${
            active ? 'translate-x-6' : 'translate-x-0'
          }`} 
        />
      </button>
    </div>
  );
}
