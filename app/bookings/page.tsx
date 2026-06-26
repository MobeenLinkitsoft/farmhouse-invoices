"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  farmhouse: string;
  villa?: string;
  customer_name: string;
  phone?: string;
  cnic?: string;
  booking_amount?: number;
  advance_amount?: number;
  balance_amount?: number;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  duration_hours: number;
};

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // View Toggle State
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFarmhouse, setFilterFarmhouse] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  // Calendar specific state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDayBookings, setSelectedDayBookings] = useState<
    Booking[] | null
  >(null);

  // Fetch from Supabase Cloud on load
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("check_in_date", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const deleteBooking = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to cancel this booking? It will be deleted from the cloud.",
      )
    ) {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (!error) {
        setBookings(bookings.filter((b) => b.id !== id));
      } else {
        alert("Failed to delete booking.");
      }
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getSlotType = (checkInTime: string, durationHours: number) => {
    if (!checkInTime) return "";
    if (durationHours >= 20) return "Day + Night Slot";
    const hour = parseInt(checkInTime.split(":")[0], 10);
    if (hour >= 6 && hour < 18) return "Day Slot";
    return "Night Slot";
  };

  // --- FILTER LOGIC ---
  const getFilteredBookings = () => {
    return bookings.filter((b) => {
      // 1. Name Search
      const matchesSearch = b.customer_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // 2. Farmhouse Filter (Now explicitly handling the split Twin Crown villas)
      const matchesFarmhouse =
        filterFarmhouse === "All" ||
        (filterFarmhouse === "Twin Crown - Platinum" && b.farmhouse === "Twin Crown" && b.villa === "Platinum") ||
        (filterFarmhouse === "Twin Crown - Gold" && b.farmhouse === "Twin Crown" && b.villa === "Gold") ||
        b.farmhouse === filterFarmhouse;

      // 3. Date Filter
      let matchesDate = true;
      if (filterDate) {
        const filterStart = new Date(`${filterDate}T00:00:00`).getTime();
        const filterEnd = new Date(`${filterDate}T23:59:59`).getTime();
        const bStart = new Date(
          `${b.check_in_date}T${b.check_in_time}`,
        ).getTime();
        const bEnd = new Date(
          `${b.check_out_date}T${b.check_out_time}`,
        ).getTime();
        matchesDate = bStart <= filterEnd && bEnd >= filterStart;
      }

      return matchesSearch && matchesFarmhouse && matchesDate;
    });
  };

  const filteredBookings = getFilteredBookings();

  // --- CALENDAR LOGIC ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getBookingsForDay = (day: number) => {
    const targetDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const targetTime = new Date(targetDateStr).getTime();

    return filteredBookings.filter((b) => {
      const checkInTime = new Date(b.check_in_date).getTime();
      const checkOutTime = new Date(b.check_out_date).getTime();

      // SMART DURATION LOGIC:
      // If it's a standard overnight slot (<= 15 hours), ONLY show it on the check-in date
      if (b.duration_hours && b.duration_hours <= 15) {
        return b.check_in_date === targetDateStr;
      }
      // If it's a multi-day 22-hour slot, show it on both check-in and check-out days
      else {
        return targetTime >= checkInTime && targetTime <= checkOutTime;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8 font-sans text-gray-800">
      <div className="max-w-[90rem] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-wide">
              Cloud Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">
              Manage and filter your farmhouse parties.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* View Toggles */}
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 w-full sm:w-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 px-4 sm:px-6 py-2.5 rounded-md text-sm font-bold transition ${viewMode === "list" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex-1 px-4 sm:px-6 py-2.5 rounded-md text-sm font-bold transition ${viewMode === "calendar" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}
              >
                Calendar
              </button>
            </div>
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-lg shadow transition font-bold uppercase tracking-wider text-sm whitespace-nowrap">
                ← Invoice Generator
              </button>
            </Link>
          </div>
        </div>

        {/* --- ADVANCED FILTER BAR --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Search Customer
            </label>
            <input
              type="text"
              placeholder="e.g. Ali Ahmed"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Filter Farmhouse
            </label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filterFarmhouse}
              onChange={(e) => setFilterFarmhouse(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Green Haven">Green Haven</option>
              <option value="Twin Crown - Platinum">Twin Crown - Platinum</option>
              <option value="Twin Crown - Gold">Twin Crown - Gold</option>
              <option value="AL RAHMAN RETREAT">AL RAHMAN RETREAT</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Filter Specific Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterFarmhouse("All");
                setFilterDate("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg transition border border-gray-300 text-sm h-[42px]"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        {loading ? (
          <div className="text-center p-12 text-gray-500 font-bold text-xl animate-pulse">
            Syncing with Cloud Database...
          </div>
        ) : viewMode === "calendar" ? (
          /* ================= CALENDAR VIEW (Responsive) ================= */
          <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <button
                onClick={() =>
                  setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1)
                }
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold shadow-sm text-sm sm:text-base"
              >
                ← Prev
              </button>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-wider text-center">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={() =>
                  setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1)
                }
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-bold shadow-sm text-sm sm:text-base"
              >
                Next →
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center font-black text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest bg-gray-50 p-1 sm:p-2 rounded-lg">
                <div>
                  <span className="hidden sm:inline">Sun</span>
                  <span className="sm:hidden">S</span>
                </div>
                <div>
                  <span className="hidden sm:inline">Mon</span>
                  <span className="sm:hidden">M</span>
                </div>
                <div>
                  <span className="hidden sm:inline">Tue</span>
                  <span className="sm:hidden">T</span>
                </div>
                <div>
                  <span className="hidden sm:inline">Wed</span>
                  <span className="sm:hidden">W</span>
                </div>
                <div>
                  <span className="hidden sm:inline">Thu</span>
                  <span className="sm:hidden">T</span>
                </div>
                <div>
                  <span className="hidden sm:inline">Fri</span>
                  <span className="sm:hidden">F</span>
                </div>
                <div>
                  <span className="hidden sm:inline">Sat</span>
                  <span className="sm:hidden">S</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty slots for start of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="p-1 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-dashed border-gray-200"
                  ></div>
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayBookings = getBookingsForDay(i + 1);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDayBookings(dayBookings)}
                      className={`min-h-[70px] sm:min-h-[120px] p-1 sm:p-2 border sm:border-2 rounded-lg sm:rounded-xl cursor-pointer transition flex flex-col ${dayBookings.length > 0 ? "border-blue-200 bg-blue-50/50 hover:bg-blue-100" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <div
                        className={`font-bold text-[10px] sm:text-sm mb-1 sm:mb-2 text-center sm:text-left ${dayBookings.length > 0 ? "text-blue-800" : "text-gray-400"}`}
                      >
                        {i + 1}
                      </div>

                      <div className="flex flex-col gap-1 flex-grow">
                        {dayBookings.map((b) => {
                          const isGH = b.farmhouse === "Green Haven";
                          const isTC = b.farmhouse === "Twin Crown";
                          const pillColor = isGH
                            ? "bg-green-600"
                            : isTC
                              ? "bg-gray-900"
                              : "bg-blue-600";
                          const initials = isGH ? "GH" : isTC ? "TC" : "AR";
                          const slotType = getSlotType(b.check_in_time, b.duration_hours);

                          return (
                            <div
                              key={b.id}
                              className={`text-[9px] sm:text-xs px-1 py-0.5 sm:p-1.5 rounded sm:rounded-md font-medium text-white shadow-sm flex flex-col gap-0 sm:gap-0.5 leading-none sm:leading-tight overflow-hidden ${pillColor}`}
                            >
                              <span className="font-bold truncate">
                                {b.customer_name}
                              </span>
                              <span className="hidden sm:block text-[10px] opacity-90 truncate">
                                {initials}{" "}
                                {b.villa ? `(${b.villa.charAt(0)})` : ""} •{" "}
                                {slotType}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal for Day Details */}
            {selectedDayBookings !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-lg w-full relative max-h-[85vh] overflow-y-auto">
                  <button
                    onClick={() => setSelectedDayBookings(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-xl"
                  >
                    ✕
                  </button>
                  <h3 className="text-lg sm:text-xl font-black uppercase mb-4 border-b pb-2">
                    Detailed Schedule
                  </h3>

                  {selectedDayBookings.length === 0 ? (
                    <p className="text-gray-500 font-medium py-4">
                      No parties scheduled for this day.
                    </p>
                  ) : (
                    selectedDayBookings.map((b) => {
                      const isGH = b.farmhouse === "Green Haven";
                      const isTC = b.farmhouse === "Twin Crown";
                      const tagColor = isGH
                        ? "bg-green-100 text-green-800 border-green-200"
                        : isTC
                          ? "bg-gray-200 text-gray-800 border-gray-300"
                          : "bg-blue-100 text-blue-800 border-blue-200";
                      const slotType = getSlotType(b.check_in_time, b.duration_hours);

                      return (
                        <div
                          key={b.id}
                          className={`p-4 border-2 rounded-xl mb-4 shadow-sm bg-white ${tagColor.split(" ")[0]}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                            <h4 className="font-black text-xl text-gray-900">
                              {b.customer_name}
                            </h4>
                            <div className="flex flex-col gap-1 items-end">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider inline-block w-fit ${tagColor}`}
                              >
                                {b.farmhouse} {b.villa ? `- ${b.villa}` : ""}
                              </span>
                              <span className="text-[10px] font-black uppercase bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm text-gray-700">
                                {slotType} ({b.duration_hours}h)
                              </span>
                            </div>
                          </div>

                          <div className="bg-white/60 p-3 sm:p-4 rounded-lg border border-white/40 mt-3 space-y-3">
                            {/* Contact Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border-b border-black/10 pb-3">
                              <p className="font-semibold text-gray-700">
                                📞 {b.phone || "N/A"}
                              </p>
                              <p className="font-semibold text-gray-700">
                                🆔 {b.cnic || "N/A"}
                              </p>
                            </div>

                            {/* Financial Details */}
                            <div className="space-y-1.5 border-b border-black/10 pb-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                  Total Booking
                                </span>
                                <span className="font-bold text-gray-900">
                                  {b.booking_amount || 0}/- PKR
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-green-600 uppercase text-[10px] tracking-wider">
                                  Advance Paid
                                </span>
                                <span className="font-bold text-green-700">
                                  {b.advance_amount || 0}/- PKR
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-red-500 uppercase text-[10px] tracking-wider">
                                  Balance Due
                                </span>
                                <span className="font-black text-red-600">
                                  {b.balance_amount || 0}/- PKR
                                </span>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                  Check-in
                                </span>
                                <span className="font-bold text-gray-900 text-right">
                                  {formatDate(b.check_in_date)}{" "}
                                  <br className="sm:hidden" /> @{" "}
                                  {formatTime(b.check_in_time)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                                  Check-out
                                </span>
                                <span className="font-bold text-gray-900 text-right">
                                  {formatDate(b.check_out_date)}{" "}
                                  <br className="sm:hidden" /> @{" "}
                                  {formatTime(b.check_out_time)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              deleteBooking(b.id);
                              setSelectedDayBookings(null);
                              fetchBookings();
                            }}
                            className="w-full mt-4 text-sm bg-red-100 text-red-700 font-bold py-2 rounded-lg hover:bg-red-200 transition"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= LIST VIEW ================= */
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 px-2">
              <h2 className="text-xl font-bold">Search Results</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                {filteredBookings.length} Found
              </span>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500 font-medium text-base sm:text-lg">
                  No bookings found matching your filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterFarmhouse("All");
                    setFilterDate("");
                  }}
                  className="mt-4 text-blue-600 hover:underline font-bold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredBookings.map((b) => {
                  const isGH = b.farmhouse === "Green Haven";
                  const isTC = b.farmhouse === "Twin Crown";
                  const tagColor = isGH
                    ? "bg-green-100 text-green-800"
                    : isTC
                      ? "bg-gray-200 text-gray-800"
                      : "bg-blue-100 text-blue-800";
                  const isMultiDay = b.check_in_date !== b.check_out_date;
                  const slotType = getSlotType(b.check_in_time, b.duration_hours);

                  return (
                    <div
                      key={b.id}
                      className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition gap-4"
                    >
                      {/* Top Header Row */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-gray-900">
                            {b.customer_name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mt-2 inline-block ${tagColor}`}
                          >
                            {b.farmhouse} {b.villa ? `- ${b.villa}` : ""}
                          </span>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 font-black text-xs px-3 py-1.5 rounded-lg border border-indigo-100 whitespace-nowrap">
                          {b.duration_hours}h • {slotType}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="text-sm font-semibold text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 border-b border-gray-100 pb-3">
                        <p>📞 {b.phone || "N/A"}</p>
                        <p>🆔 {b.cnic || "N/A"}</p>
                      </div>

                      {/* Financials Row */}
                      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center text-xs font-bold mb-1">
                        <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                          <span className="block text-gray-400 uppercase text-[8px] sm:text-[9px] mb-0.5">
                            Booking
                          </span>
                          {b.booking_amount || 0}/-
                        </div>
                        <div className="bg-green-50 text-green-700 p-2 rounded-lg border border-green-200">
                          <span className="block text-green-500 uppercase text-[8px] sm:text-[9px] mb-0.5">
                            Advance
                          </span>
                          {b.advance_amount || 0}/-
                        </div>
                        <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-200">
                          <span className="block text-red-400 uppercase text-[8px] sm:text-[9px] mb-0.5">
                            Balance
                          </span>
                          {b.balance_amount || 0}/-
                        </div>
                      </div>

                      {/* Timeline Data */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col sm:flex-row justify-between gap-3 text-sm mt-1">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                            Check-in
                          </p>
                          <p className="font-bold text-gray-900">
                            {formatDate(b.check_in_date)}
                          </p>
                          <p className="text-xs font-semibold text-gray-600">
                            {formatTime(b.check_in_time)}
                          </p>
                        </div>

                        <div className="hidden sm:flex flex-col justify-center items-center px-2">
                          <span className="text-gray-300 font-bold">➔</span>
                          {isMultiDay && (
                            <span className="text-[8px] uppercase tracking-widest text-indigo-400 font-black mt-1">
                              Multi
                            </span>
                          )}
                        </div>

                        <div className="sm:text-right">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                            Check-out
                          </p>
                          <p className="font-bold text-gray-900">
                            {formatDate(b.check_out_date)}
                          </p>
                          <p className="text-xs font-semibold text-gray-600">
                            {formatTime(b.check_out_time)}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="text-red-600 hover:text-white hover:bg-red-600 border border-red-200 font-bold text-xs px-4 py-2 rounded-lg transition w-full sm:w-auto"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}