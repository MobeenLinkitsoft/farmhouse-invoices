"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function InvoiceGenerator() {
  // Main State
  const [farmhouse, setFarmhouse] = useState("Green Haven");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");

  // Dates/Times
  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");

  // Pricing
  const [bookingAmount, setBookingAmount] = useState<number | "">("");
  const [discountedAmount, setDiscountedAmount] = useState<number | "">("");
  const [advanceAmount, setAdvanceAmount] = useState<number | "">("");

  // Other
  const [villa, setVilla] = useState("Platinum");
  const [instruction, setInstruction] = useState("");

  // Calculations
  const parsedBooking = Number(bookingAmount) || 0;
  const parsedDiscounted = Number(discountedAmount) || 0;
  const parsedAdvance = Number(advanceAmount) || 0;
  const hasDiscount = parsedDiscounted > 0 && parsedDiscounted < parsedBooking;
  const discountValue = hasDiscount ? parsedBooking - parsedDiscounted : 0;
  const discountPercentage = hasDiscount
    ? ((discountValue / parsedBooking) * 100).toFixed(1)
    : "0.0";
  const finalPrice = hasDiscount ? parsedDiscounted : parsedBooking;
  const balance = finalPrice - parsedAdvance;

  // --- FORMATTING (Now includes Day of the week!) ---
  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          weekday: "long", // This adds "Monday", "Tuesday", etc.
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formatTime = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    let hr = parseInt(h, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;
    return `${hr}:${m} ${ampm}`;
  };

  let durationHours = 0;
  let formattedSlot = "—";
  if (checkInDate && checkInTime && checkOutDate && checkOutTime) {
    const start = new Date(`${checkInDate}T${checkInTime}`).getTime();
    const end = new Date(`${checkOutDate}T${checkOutTime}`).getTime();
    durationHours = Math.round((end - start) / (1000 * 60 * 60));
    formattedSlot = `${durationHours > 0 ? durationHours + " Hours | " : ""}${formatTime(checkInTime)} to ${formatTime(checkOutTime)}`;
  }

  // Theming
  const isGH = farmhouse === "Green Haven";
  const isTC = farmhouse === "Twin Crown";
  const isAR = farmhouse === "AL RAHMAN RETREAT";

  const themeBg = isGH ? "bg-green-700" : isTC ? "bg-black" : "bg-blue-900";
  const themeText = isGH
    ? "text-green-700"
    : isTC
      ? "text-black"
      : "text-blue-900";
  const themeBorder = isGH
    ? "border-green-700"
    : isTC
      ? "border-black"
      : "border-blue-900";
  const themeLightBg = isGH
    ? "bg-green-50"
    : isTC
      ? "bg-gray-100"
      : "bg-blue-50";
  const headerTextClass = isGH
    ? "text-white"
    : isTC
      ? "text-yellow-500"
      : "text-white";

  const headerImage = isGH ? "/2.jpeg" : isTC ? "/1.jpeg" : "/alrahman.jpeg";
  const qrImage = isGH ? "/qrgh.png" : isTC ? "/qrtc.png" : "/qrar.png";

  const socialHandle = isGH
    ? "GreenHavenResorts"
    : isTC
      ? "TwinCrownResorts"
      : "AlRahmanRetreat";
  const supervisorName = isGH ? "Mr Ramesh" : isTC ? "Junaid" : "Management";
  const supervisorContact = isGH
    ? "03432771861"
    : isTC
      ? "0329-2026402"
      : "0300-0000000";

  const handleDownload = async () => {
    if (!customerName || !checkInDate || !checkOutDate)
      return alert("Please fill essential details before downloading!");

    window.scrollTo(0, 0);
    const p1 = document.getElementById("invoice-page-1");
    const p2 = document.getElementById("invoice-page-2");
    if (p1 && p2) {
      const c1 = await html2canvas(p1, { scale: 2, useCORS: true, scrollY: 0 });
      const c2 = await html2canvas(p2, { scale: 2, useCORS: true, scrollY: 0 });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(c1.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, 210, 297);
      pdf.addPage();
      pdf.addImage(c2.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, 210, 297);
      pdf.save(`${customerName.replace(/\s+/g, "_")}_Invoice.pdf`);
    }
  };

  const handleSync = async () => {
    if (!customerName || !checkInDate || !checkOutDate)
      return alert("Please fill essential details before syncing!");
    if (durationHours <= 0)
      return alert("Error: Check-out time must be after check-in time.");

    const { error } = await supabase.from("bookings").insert([
      {
        farmhouse,
        villa: isTC ? villa : null,
        customer_name: customerName,
        phone,
        cnic,
        check_in_date: checkInDate,
        check_in_time: checkInTime,
        check_out_date: checkOutDate,
        check_out_time: checkOutTime,
        booking_amount: parsedBooking,
        advance_amount: parsedAdvance,
        balance_amount: balance,
        instruction,
        duration_hours: durationHours,
      },
    ]);

    if (error) {
      alert("Sync Failed: " + error.message);
    } else {
      alert("✅ Successfully synced to cloud!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 font-sans text-gray-800">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit lg:sticky lg:top-8">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-2xl font-bold">Invoice Details</h2>
            <Link href="/bookings">
              <button className="bg-gray-800 hover:bg-black text-white text-[10px] px-3 py-1.5 rounded font-bold uppercase transition">
                Dashboard →
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Select Farmhouse
              </label>
              <select
                className="w-full border p-2.5 rounded outline-none"
                value={farmhouse}
                onChange={(e) => {
                  setFarmhouse(e.target.value);
                  setInstruction("");
                }}
              >
                <option value="Green Haven">Green Haven</option>
                <option value="Twin Crown">Twin Crown</option>
                <option value="AL RAHMAN RETREAT">AL RAHMAN RETREAT</option>
              </select>
            </div>

            {isTC && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Select Villa
                </label>
                <select
                  className="w-full border p-2.5 rounded outline-none"
                  value={villa}
                  onChange={(e) => setVilla(e.target.value)}
                >
                  <option value="Platinum">Platinum Villa</option>
                  <option value="Gold">Gold Villa</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  className="w-full border p-2.5 rounded outline-none"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Phone Num
                </label>
                <input
                  type="text"
                  className="w-full border p-2.5 rounded outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">CNIC</label>
              <input
                type="text"
                className="w-full border p-2.5 rounded outline-none"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </div>

            <div className="p-3 bg-gray-50 border rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                Check-in
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="date"
                  className="w-full border p-2 rounded text-sm outline-none"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
                <input
                  type="time"
                  className="w-full border p-2 rounded text-sm outline-none"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                Check-out
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="w-full border p-2 rounded text-sm outline-none"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
                <input
                  type="time"
                  className="w-full border p-2 rounded text-sm outline-none"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Orig. Booking (PKR)
                </label>
                <input
                  type="number"
                  className="w-full border p-2.5 rounded outline-none"
                  value={bookingAmount}
                  onChange={(e) => setBookingAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-green-700">
                  Discount Price
                </label>
                <input
                  type="number"
                  className="w-full border p-2.5 rounded outline-none"
                  placeholder="Optional"
                  value={discountedAmount}
                  onChange={(e) => setDiscountedAmount(Number(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Advance Received (PKR)
                </label>
                <input
                  type="number"
                  className="w-full border p-2.5 rounded outline-none"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-semibold mb-3">
                Special Instructions
              </label>
              <div className="flex gap-6">
                <label
                  className={`flex items-center gap-2 cursor-pointer hover:${themeText}`}
                >
                  <input
                    type="radio"
                    name="instruction"
                    value={isGH ? "non AC" : "none ac"}
                    onChange={(e) => setInstruction(e.target.value)}
                    className={`w-4 h-4 ${themeText}`}
                  />{" "}
                  {isGH ? "non AC" : "none ac"}
                </label>
                <label
                  className={`flex items-center gap-2 cursor-pointer hover:${themeText}`}
                >
                  <input
                    type="radio"
                    name="instruction"
                    value={isGH ? "with one AC" : isAR ? "one ac" : "two ac"}
                    onChange={(e) => setInstruction(e.target.value)}
                    className={`w-4 h-4 ${themeText}`}
                  />{" "}
                  {isGH ? "with one AC" : isAR ? "one ac" : "two ac"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleDownload}
                className="w-full bg-gray-800 hover:bg-black text-white font-bold py-3.5 rounded transition shadow-md text-sm"
              >
                Download PDF
              </button>
              <button
                onClick={handleSync}
                className={`w-full text-white font-bold py-3.5 rounded transition shadow-md text-sm ${isGH ? "bg-green-700 hover:bg-green-800" : isTC ? "bg-gray-900 hover:bg-black" : "bg-blue-800 hover:bg-blue-900"}`}
              >
                Sync to Cloud
              </button>
            </div>
          </div>
        </div>

        {/* Previews */}
        <div className="lg:col-span-8 w-full overflow-x-auto pb-12">
          <div className="flex flex-col items-center gap-8 min-w-[210mm]">
            {/* PAGE 1 */}
            <div
              id="invoice-page-1"
              className="bg-white w-[210mm] min-w-[210mm] h-[297mm] shadow-xl p-8 border border-gray-200 flex flex-col"
            >
              <div className="relative h-[176px] w-full rounded-xl overflow-hidden mb-6 shrink-0">
                <img
                  src={headerImage}
                  alt="Farmhouse Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div
                className={`flex justify-between items-end mb-6 border-b-2 ${themeBorder} pb-4 shrink-0`}
              >
                <div>
                  <h2
                    className={`text-4xl font-black uppercase tracking-widest ${themeText}`}
                  >
                    Invoice
                  </h2>
                  <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
                    Official Booking Document
                  </p>
                </div>
                <div className="bg-white p-2 border rounded">
                  <img
                    src={qrImage}
                    alt="QR Code"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              <div
                className={`border-l-4 ${themeBorder} ${themeLightBg} p-5 mb-8 rounded-r-lg grid grid-cols-2 gap-y-4 gap-x-8 text-sm shrink-0`}
              >
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                    Customer
                  </span>
                  <span className="font-bold">{customerName || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                    Phone
                  </span>
                  <span className="font-semibold">{phone || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                    CNIC
                  </span>
                  <span className="font-semibold">{cnic || "—"}</span>
                </div>
                {/* Updated Date rendering */}
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                    Date
                  </span>
                  <span className="font-semibold">
                    {formatDate(checkInDate)}
                  </span>
                </div>
                {isTC && (
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                      Villa
                    </span>
                    <span className="font-semibold">{villa} Villa</span>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                    Slot
                  </span>
                  <span className="font-semibold">{formattedSlot}</span>
                </div>
              </div>

              <table className="w-full mb-8 border-collapse border border-gray-300 text-sm shrink-0">
                <thead className={themeBg}>
                  <tr>
                    <th
                      className={`p-3 text-left font-bold uppercase border border-gray-300 w-2/3 ${headerTextClass}`}
                    >
                      Item Descriptions
                    </th>
                    <th
                      className={`p-3 text-right font-bold uppercase border border-gray-300 w-1/3 ${headerTextClass}`}
                    >
                      Amount (PKR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-semibold uppercase border-r">
                      Resort Booking
                    </td>
                    <td className="p-3 text-right">{parsedBooking}/-</td>
                  </tr>
                  {hasDiscount && (
                    <tr
                      className={`${isAR ? "bg-blue-50" : "bg-green-50"} border-b`}
                    >
                      <td
                        className={`p-3 font-semibold uppercase border-r ${themeText}`}
                      >
                        Discount ({discountPercentage}%)
                      </td>
                      <td className={`p-3 text-right font-bold ${themeText}`}>
                        - {discountValue}/-
                      </td>
                    </tr>
                  )}
                  <tr className="bg-red-50 border-b">
                    <td className="p-3 font-semibold uppercase border-r">
                      Advance Paid
                    </td>
                    <td className="p-3 text-right text-red-600">
                      - {parsedAdvance}/-
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-semibold uppercase border-r">
                      Tax
                    </td>
                    <td className="p-3 text-right text-gray-500">0.00</td>
                  </tr>
                  <tr className={`border-b-2 ${themeBorder} ${themeLightBg}`}>
                    <td
                      className={`p-4 font-bold uppercase border-r ${themeText}`}
                    >
                      Total Balance Due
                    </td>
                    <td
                      className={`p-4 text-right font-black text-lg ${themeText}`}
                    >
                      {balance}/-
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 shrink-0">
                <div className="border p-4 rounded-lg">
                  <h3
                    className={`font-bold uppercase mb-3 text-sm ${themeText}`}
                  >
                    Payment Details
                  </h3>
                  {isGH && (
                    <div className="text-sm space-y-1.5">
                      <p>
                        <span className="font-bold">Bank:</span> Bank OF Punjab
                      </p>
                      <p>
                        <span className="font-bold">Account:</span>{" "}
                        2050439779800019
                      </p>
                      <p>
                        <span className="font-bold">IBAN:</span>{" "}
                        PK56BPUN2050439779800019
                      </p>
                    </div>
                  )}
                  {isTC && (
                    <div className="text-sm space-y-1.5">
                      <p>
                        <span className="font-bold">Bank:</span> Bank Alfalah
                      </p>
                      <p>
                        <span className="font-bold">Account:</span>{" "}
                        55295002941161
                      </p>
                      <p>
                        <span className="font-bold">IBAN:</span>{" "}
                        PK77ALFH5529005002941161
                      </p>
                    </div>
                  )}
                  {isAR && (
                    <div className="text-[13px] space-y-1">
                      <p>
                        <span className="font-bold">Bank:</span> Bank Alfalah
                      </p>
                      <p>
                        <span className="font-bold">Account:</span>{" "}
                        55295002951969
                      </p>
                      <p>
                        <span className="font-bold">IBAN:</span>{" "}
                        PK37ALFH5529005002951969
                      </p>
                    </div>
                  )}
                </div>
                {instruction && (
                  <div
                    className={`${themeLightBg} border p-4 rounded-lg flex flex-col justify-center`}
                  >
                    <h3
                      className={`font-bold uppercase mb-2 text-sm ${themeText}`}
                    >
                      Special Instructions
                    </h3>
                    <p className="font-bold capitalize border-l-4 border-gray-400 pl-3">
                      {instruction}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-auto text-center text-xs text-gray-400">
                Page 1 of 2
              </div>
            </div>

            {/* PAGE 2 */}
            <div
              id="invoice-page-2"
              className="bg-white w-[210mm] min-w-[210mm] h-[297mm] shadow-xl p-8 border flex flex-col"
            >
              <div className={`mb-8 border-b-2 ${themeBorder} pb-4`}>
                <h2
                  className={`text-2xl font-black uppercase tracking-widest ${themeText}`}
                >
                  {farmhouse}
                </h2>
                <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
                  Policies & Terms
                </p>
              </div>
              <div className="mb-8">
                <h4 className={`font-bold uppercase mb-4 text-lg ${themeText}`}>
                  Terms & Conditions
                </h4>
                <ul className="list-disc pl-6 space-y-3 font-medium text-sm">
                  <li>All payments are non-refundable after confirmation.</li>
                  <li>Please carry a valid ID at check-in.</li>
                  <li>
                    Any damage to resort property will be charged accordingly.
                  </li>
                  <li>
                    Early check-in & late check-out are subject to availability.
                  </li>
                  <li>
                    Guests are requested to maintain a peaceful and
                    family-friendly environment.
                  </li>
                  <li>Outside food is allowed.</li>
                  <li>
                    Drugs, weapons, and firing are strictly prohibited inside
                    the resort premises.
                  </li>
                  <li>
                    Check-in policy will be shared with all customers after
                    booking confirmation.
                  </li>
                </ul>
              </div>
              <div className={`mt-8 ${themeLightBg} border rounded-lg p-6`}>
                <div className="flex gap-6 text-xs font-bold uppercase justify-center mb-4">
                  <span>Facebook: @{socialHandle}</span>
                  <span>Instagram: @{socialHandle}</span>
                  <span>TikTok: @{socialHandle}</span>
                </div>
                <div className="text-center text-sm font-bold uppercase pt-4 border-t">
                  Official Supervisor: {supervisorName} | Contact:{" "}
                  {supervisorContact}
                </div>
              </div>
              <div className="flex-grow"></div>
              <div
                className={`text-center text-xs border-t-2 ${themeBorder} pt-6 font-bold tracking-wide`}
              >
                {isGH ? (
                  <p>
                    This is a computer-generated invoice and does not require a
                    signature. If you have any questions, please call or
                    WhatsApp us at our official number: 031 111 27 008.
                  </p>
                ) : isTC ? (
                  <>
                    <p>
                      Thank you for choosing Twin Crown Resorts. This is a
                      computer-generated slip and does not require a signature.
                    </p>
                    <p className="mt-1">
                      For any queries, please contact our official resort
                      number: 📞 +92 328 2329708
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Thank you for choosing AL RAHMAN RETREAT. This is a
                      computer-generated slip and does not require a signature.
                    </p>
                    <p className="mt-1">
                      For any queries, please contact management.
                    </p>
                  </>
                )}
              </div>
              <div className="mt-6 text-center text-xs text-gray-400">
                Page 2 of 2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}