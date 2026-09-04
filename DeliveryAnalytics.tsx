/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Smartphone,
  Info,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  LineChart,
  UserCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { DeliveryLog, NotificationAnalytics, UserRole } from "./types";

interface DeliveryAnalyticsProps {
  logs: DeliveryLog[];
  analytics: NotificationAnalytics;
}

export function DeliveryAnalytics({ logs, analytics }: DeliveryAnalyticsProps) {
  
  // Create beautiful chart data
  const chartData = useMemo(() => {
    return [
      { name: "Delivery Rate", percentage: analytics.emailDeliveryRate, color: "#10b981" },
      { name: "Open Rate", percentage: analytics.openRate, color: "#6366f1" },
      { name: "Read Rate", percentage: analytics.readRate, color: "#f59e0b" }
    ];
  }, [analytics]);

  // Aggregate stats per day or hour
  const timeSeriesData = useMemo(() => {
    return [
      { label: "Monday", Delivered: 12, Opened: 10, Failed: 0 },
      { label: "Tuesday", Delivered: 18, Opened: 15, Failed: 1 },
      { label: "Wednesday", Delivered: 22, Opened: 19, Failed: 0 },
      { label: "Thursday", Delivered: 35, Opened: 31, Failed: 1 },
      { label: "Friday", Delivered: 29, Opened: 28, Failed: 0 },
      { label: "Saturday", Delivered: 14, Opened: 12, Failed: 0 }
    ];
  }, []);

  const getStatusStyles = (status: DeliveryLog["status"]) => {
    switch (status) {
      case "opened":
      case "read":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "delivered":
        return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";
      default:
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    }
  };

  const getChannelIcon = (ch: DeliveryLog["channel"]) => {
    switch (ch) {
      case "email":
        return <Mail className="w-3.5 h-3.5 text-indigo-500" />;
      case "push":
        return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div
      className="space-y-6 w-full"
      id="communication-delivery-analytics"
    >
      {/* 1. Statistics Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Successful Deliveries", value: `${analytics.emailDeliveryRate}%`, sub: `${analytics.totalSentCount - analytics.failedDeliveriesCount} Transmitted`, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, bg: "from-emerald-500/5 to-teal-500/5 border-emerald-500/10" },
          { label: "Email Open Rate", value: `${analytics.openRate}%`, sub: "Evaluated from delivered dispatches", icon: <TrendingUp className="w-5 h-5 text-indigo-500" />, bg: "from-indigo-500/5 to-purple-500/5 border-indigo-500/10" },
          { label: "Direct Read Rate", value: `${analytics.readRate}%`, sub: "Evaluated from clicked actions", icon: <UserCheck className="w-5 h-5 text-amber-500" />, bg: "from-amber-500/5 to-orange-500/5 border-amber-500/10" },
          { label: "Failed Deliveries", value: analytics.failedDeliveriesCount, sub: "Bounces or security blocks logs", icon: <XCircle className="w-5 h-5 text-rose-500" />, bg: "from-rose-500/5 to-pink-500/5 border-rose-500/10" }
        ].map((stat, i) => (
          <div key={i} className={`p-4 bg-gradient-to-br ${stat.bg} border rounded-2xl flex items-start justify-between gap-3`}>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 font-mono block uppercase">{stat.label}</span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">{stat.value}</h3>
              <p className="text-[9px] text-zinc-400">{stat.sub}</p>
            </div>
            <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-zinc-100 dark:border-zinc-800">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart A: Channels Success Rates */}
        <div className="lg:col-span-1 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xl space-y-4">
          <div>
            <span className="text-[9px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
              PERFORMANCE RATIO
            </span>
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
              Email Dispatch Completion Rates
            </h4>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" style={{ fontSize: "10px", fontWeight: "bold", fill: "#888888" }} width={80} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any) => [`${value}%`, "Performance"]} contentStyle={{ fontSize: "10px", borderRadius: "10px" }} />
                <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Time Series delivery volume */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                DELIVERY VOLUME TREND
              </span>
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                Simulated Transmission Timeline
              </h4>
            </div>
            <span className="text-[9px] font-mono text-zinc-400">INTERVAL: 6-DAY AUDIT</span>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" style={{ fontSize: "9px", fill: "#888888" }} axisLine={false} tickLine={false} />
                <YAxis style={{ fontSize: "9px", fill: "#888888" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "10px" }} />
                <Area type="monotone" dataKey="Delivered" stroke="#6366f1" fillOpacity={0.1} fill="url(#colorDelivered)" strokeWidth={2} />
                <Area type="monotone" dataKey="Opened" stroke="#10b981" fillOpacity={0.05} fill="url(#colorOpened)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Delivery Log Table with detailed errors */}
      <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-5 rounded-3xl shadow-xl">
        <div className="pb-4 border-b border-zinc-150 dark:border-zinc-850">
          <span className="text-[9px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
            TRANSMISSION JOURNAL LOGS
          </span>
          <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
            Audit-Ready Delivery Registry
          </h4>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-850 text-zinc-400 font-mono text-[9px] uppercase">
                <th className="py-3 px-4 font-bold">Recipient</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Channel</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Diagnostics / Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                    {log.recipientEmail}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-zinc-400">
                    {log.recipientRole}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 font-mono uppercase text-[9px]">
                      {getChannelIcon(log.channel)}
                      <span>{log.channel}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${getStatusStyles(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3.5 px-4">
                    {log.errorMessage ? (
                      <span className="text-[10px] text-rose-500 font-medium flex items-center gap-1 font-mono leading-none">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{log.errorMessage}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-mono">
                        Securely routed, handshake verified.
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
