/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Link,
  Users,
  Plus,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Info,
  Globe,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarEvent, BookingSlot, CalendarEventType, UserRole, ChatParticipant } from "./types";
import { calendarService } from "./services";
import { MOCK_PARTICIPANTS } from "./mockData";

interface CalendarViewProps {
  events: CalendarEvent[];
  bookingSlots: BookingSlot[];
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  onRefresh: () => void;
  onShowAlert: (message: string, type: "success" | "info" | "error") => void;
}

export function CalendarView({
  events,
  bookingSlots,
  currentUserRole,
  currentUserId,
  currentUserName,
  onRefresh,
  onShowAlert
}: CalendarViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showCreator, setShowCreator] = useState(false);
  const [showSlotCreator, setShowSlotCreator] = useState(false);

  // Event Form State
  const [evtTitle, setEvtTitle] = useState("");
  const [evtDesc, setEvtDesc] = useState("");
  const [evtType, setEvtType] = useState<CalendarEventType>("Mock Interview");
  const [evtStart, setEvtStart] = useState("");
  const [evtEnd, setEvtEnd] = useState("");
  const [evtParticipantId, setEvtParticipantId] = useState("");
  const [evtLocation, setEvtLocation] = useState("");
  const [evtLink, setEvtLink] = useState("");

  // Slot Form State
  const [slotType, setSlotType] = useState<CalendarEventType>("Mock Interview");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");

  const isStudent = currentUserRole === "Student";
  const canSchedule = ["Admin", "Super Admin"].includes(currentUserRole);

  const getEventColors = (type: CalendarEventType) => {
    switch (type) {
      case "Interview":
        return {
          bg: "bg-indigo-500/10 dark:bg-indigo-500/5",
          border: "border-indigo-500/20",
          text: "text-indigo-600 dark:text-indigo-400",
          accent: "bg-indigo-500"
        };
      case "Mock Interview":
        return {
          bg: "bg-purple-500/10 dark:bg-purple-500/5",
          border: "border-purple-500/20",
          text: "text-purple-600 dark:text-purple-400",
          accent: "bg-purple-500"
        };
      case "Coding Assessment":
        return {
          bg: "bg-rose-500/10 dark:bg-rose-500/5",
          border: "border-rose-500/20",
          text: "text-rose-600 dark:text-rose-400",
          accent: "bg-rose-500"
        };
      case "English Assessment":
        return {
          bg: "bg-sky-500/10 dark:bg-sky-500/5",
          border: "border-sky-500/20",
          text: "text-sky-600 dark:text-sky-400",
          accent: "bg-sky-500"
        };
      case "Training Session":
        return {
          bg: "bg-blue-500/10 dark:bg-blue-500/5",
          border: "border-blue-500/20",
          text: "text-blue-600 dark:text-blue-400",
          accent: "bg-blue-500"
        };
      default:
        return {
          bg: "bg-zinc-500/10 dark:bg-zinc-500/5",
          border: "border-zinc-200 dark:border-zinc-800",
          text: "text-zinc-600 dark:text-zinc-400",
          accent: "bg-zinc-500"
        };
    }
  };

  const handleBookSlot = (slotId: string) => {
    const result = calendarService.bookSlot(slotId, currentUserId, currentUserName);
    if (result.success) {
      onShowAlert("Booking request approved! Event generated with conflict protection.", "success");
      onRefresh();
    } else {
      onShowAlert(result.error || "Booking failed", "error");
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtStart || !evtEnd) return;

    const participant = MOCK_PARTICIPANTS.find(p => p.id === evtParticipantId) || MOCK_PARTICIPANTS[0];
    const hostUser = MOCK_PARTICIPANTS.find(p => p.id === currentUserId) || MOCK_PARTICIPANTS[0];

    calendarService.addEvent({
      title: evtTitle,
      description: evtDesc,
      type: evtType,
      startTime: new Date(evtStart).toISOString(),
      endTime: new Date(evtEnd).toISOString(),
      participants: [participant, hostUser],
      timezone: "Asia/Kolkata",
      location: evtLocation || undefined,
      meetingLink: evtLink || undefined
    });

    onShowAlert(`Successfully scheduled "${evtTitle}"`, "success");
    setEvtTitle("");
    setEvtDesc("");
    setEvtLocation("");
    setEvtLink("");
    setShowCreator(false);
    onRefresh();
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotStart || !slotEnd) return;

    calendarService.createBookingSlot({
      hostId: currentUserId,
      hostName: currentUserName,
      hostRole: currentUserRole,
      startTime: new Date(slotStart).toISOString(),
      endTime: new Date(slotEnd).toISOString(),
      type: slotType
    });

    onShowAlert("New booking availability slot created and broadcasted!", "success");
    setSlotStart("");
    setSlotEnd("");
    setShowSlotCreator(false);
    onRefresh();
  };

  const filteredEvents = events.filter(evt => selectedCategory === "All" || evt.type === selectedCategory);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
      id="calendar-scheduling-view"
    >
      {/* LEFT 2 COLUMNS: Calendar & Interactive Event list */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-850">
            <div>
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                INTELLIGENT SCHEDULING
              </span>
              <h2 className="text-sm font-black text-zinc-950 dark:text-zinc-50 mt-0.5">
                Workspace Calendar Events
              </h2>
            </div>

            {canSchedule && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreator(!showCreator)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Session</span>
                </button>
                <button
                  onClick={() => setShowSlotCreator(!showSlotCreator)}
                  className="px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 text-white text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Offer Slot</span>
                </button>
              </div>
            )}
          </div>

          {/* Form to Create Custom Meeting */}
          <AnimatePresence>
            {showCreator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800 p-4 rounded-2xl"
              >
                <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
                  <h3 className="text-xs font-black text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Host Custom Session</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Session Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mock System Design Feedback"
                        value={evtTitle}
                        onChange={e => setEvtTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Category Type</label>
                      <select
                        value={evtType}
                        onChange={e => setEvtType(e.target.value as CalendarEventType)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="Interview">Interview</option>
                        <option value="Mock Interview">Mock Interview</option>
                        <option value="Training Session">Training Session</option>
                        <option value="Coding Assessment">Coding Assessment</option>
                        <option value="English Assessment">English Assessment</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={evtStart}
                        onChange={e => setEvtStart(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={evtEnd}
                        onChange={e => setEvtEnd(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Target Participant</label>
                      <select
                        value={evtParticipantId}
                        onChange={e => setEvtParticipantId(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="">-- Choose Participant --</option>
                        {MOCK_PARTICIPANTS.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Meeting Link (Optional)</label>
                      <input
                        type="url"
                        placeholder="e.g. https://meet.google.com/abc"
                        value={evtLink}
                        onChange={e => setEvtLink(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Context Details</label>
                    <textarea
                      placeholder="Brief session agenda or description..."
                      rows={2}
                      value={evtDesc}
                      onChange={e => setEvtDesc(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreator(false)}
                      className="px-4 py-2 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-[10px] font-bold text-zinc-500 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form to Offer Booking Slots */}
          <AnimatePresence>
            {showSlotCreator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800 p-4 rounded-2xl"
              >
                <form onSubmit={handleCreateSlot} className="space-y-4 text-left">
                  <h3 className="text-xs font-black text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Offer Availability Slot</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Slot Type</label>
                      <select
                        value={slotType}
                        onChange={e => setSlotType(e.target.value as CalendarEventType)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="Mock Interview">Mock Interview</option>
                        <option value="Training Session">Training Session</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={slotStart}
                        onChange={e => setSlotStart(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase font-mono">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={slotEnd}
                        onChange={e => setSlotEnd(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSlotCreator(false)}
                      className="px-4 py-2 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-[10px] font-bold text-zinc-500 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Publish Open Slot
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0">
            {["All", "Interview", "Mock Interview", "Coding Assessment", "Training Session", "Holiday"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 border border-zinc-200/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Events Stack */}
          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 space-y-3">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-zinc-300" />
                </div>
                <p className="text-xs font-bold">No calendar events detected under this category filter.</p>
              </div>
            ) : (
              filteredEvents.map(evt => {
                const styles = getEventColors(evt.type);
                const startDate = new Date(evt.startTime);
                const endDate = new Date(evt.endTime);
                return (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-2xl border ${styles.bg} ${styles.border} flex items-start sm:items-center justify-between gap-4 transition-all`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Vertical highlight bar */}
                      <div className={`w-1 h-12 rounded-full ${styles.text} bg-current shrink-0`} />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${styles.bg} ${styles.text}`}>
                            {evt.type}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>
                              {startDate.toLocaleDateString([], { month: "short", day: "numeric" })} • {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                          {evt.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                          {evt.description}
                        </p>

                        {evt.participants.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[9px] text-zinc-400 font-mono">
                              Members: {evt.participants.map(p => p.name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {evt.meetingLink && (
                        <a
                          href={evt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:scale-105 transition-transform"
                          title="Join Online Session"
                        >
                          <Link className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR COLUMN: Availability slots for Mock Booking */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-850 p-6 rounded-3xl shadow-xl flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-zinc-150 dark:border-zinc-850">
              <span className="text-[10px] text-indigo-500 font-mono font-bold tracking-widest uppercase block">
                CONFLICT-FREE BOOKING
              </span>
              <h3 className="text-sm font-black text-zinc-950 dark:text-zinc-50 mt-0.5">
                Available Booking Slots
              </h3>
            </div>

            {isStudent ? (
              <div className="bg-indigo-500/5 p-3.5 border border-indigo-500/10 rounded-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-zinc-500 leading-relaxed">
                  <span className="font-bold text-indigo-600 block mb-0.5">Mock Practice Booking</span>
                  Click <strong>Book</strong> on any available mentor or recruiter slots. The scheduling engine will perform automatic overlap checks inside your calendar instantly.
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/5 p-3.5 border border-amber-500/10 rounded-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-zinc-500 leading-relaxed">
                  <span className="font-bold text-amber-600 block mb-0.5">Admin Availability Log</span>
                  As an administrator, use <strong>Offer Slot</strong> in the calendar bar above to log hours where candidates can book you.
                </div>
              </div>
            )}

            {/* Slots Stack */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 pt-1">
              {bookingSlots.length === 0 ? (
                <p className="text-[11px] text-zinc-400 text-center py-6">No open booking slots catalogued.</p>
              ) : (
                bookingSlots.map(slot => {
                  const startDate = new Date(slot.startTime);
                  return (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        slot.isBooked
                          ? "bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200/40 text-zinc-400"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 text-zinc-800 dark:text-zinc-150"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono font-bold text-zinc-400">
                          {slot.type}
                        </span>
                        {slot.isBooked ? (
                          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                            Booked
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                            Available
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-xs font-bold truncate">
                          Mentor: {slot.hostName}
                        </h5>
                        <div className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span>
                            {startDate.toLocaleDateString([], { month: "short", day: "numeric" })} • {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {slot.isBooked && slot.bookedByName && (
                          <div className="text-[9px] text-indigo-500 font-mono flex items-center gap-1 pt-1 border-t border-zinc-100/50">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                            <span>Student: {slot.bookedByName}</span>
                          </div>
                        )}
                      </div>

                      {!slot.isBooked && isStudent && (
                        <button
                          onClick={() => handleBookSlot(slot.id)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                        >
                          Book Slot
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Timezone banner */}
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 mt-4 flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono justify-center shrink-0">
            <Globe className="w-3.5 h-3.5 text-zinc-400 animate-spin-slow" />
            <span>Timezone: Asia/Kolkata (IST - UTC+5:30)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
