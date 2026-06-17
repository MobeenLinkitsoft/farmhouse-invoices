"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export default function InvoiceGenerator() {
  // Main State
  const [farmhouse, setFarmhouse] = useState("Green Haven");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  // Pricing State
  const [bookingAmount, setBookingAmount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const balance = bookingAmount - advanceAmount;

  // Farmhouse Specific State
  const [villa, setVilla] = useState("Platinum");
  const [instruction, setInstruction] = useState("");

  // --- Dynamic Theming ---
  const isGH = farmhouse === "Green Haven";
  const themeBg = isGH ? "bg-green-700" : "bg-black";
  const themeText = isGH ? "text-green-700" : "text-black";
  const themeBorder = isGH ? "border-green-700" : "border-black";
  const themeLightBg = isGH ? "bg-green-50" : "bg-gray-100";
  const headerTextClass = isGH ? "text-white" : "text-yellow-500";

  // Images (Make sure exact case matches your public folder files)
  const headerImage = isGH ? "/2.jpeg" : "/1.jpeg";
  const qrImage = isGH ? "/qrgh.png" : "/qrtc.png";

  const handleDownload = async () => {
    const element = document.getElementById("invoice-capture");
    if (!element) {
      console.error("Invoice element not found!");
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate ratio to fit BOTH width and height on a single A4 page
    const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);

    const imgWidth = canvasWidth * ratio;
    const imgHeight = canvasHeight * ratio;

    // Center the image horizontally on the page
    const imgX = (pdfWidth - imgWidth) / 2;

    pdf.addImage(imgData, "JPEG", imgX, 0, imgWidth, imgHeight);

    // Formatting the exact file name: name_Invoice_Farmhouse_Date_Slot.pdf
    const fName = customerName ? customerName.replace(/\s+/g, "_") : "Customer";
    const fFarmhouse = farmhouse.replace(/\s+/g, ""); // "Green Haven" becomes "GreenHaven"
    const fDate = date ? date.replace(/\s+/g, "_") : "Date";
    const fSlot = slot ? slot.replace(/\s+/g, "_") : "Slot";

    const fileName = `${fName}_Invoice_${fFarmhouse}_${fDate}_${fSlot}.pdf`;

    pdf.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: FORM (Takes 4 columns) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-md h-fit sticky top-8">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">
            Invoice Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Select Farmhouse
              </label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={farmhouse}
                onChange={(e) => {
                  setFarmhouse(e.target.value);
                  setInstruction(""); // Reset instructions on change
                }}
              >
                <option value="Green Haven">Green Haven</option>
                <option value="Twin Crown">Twin Crown</option>
              </select>
            </div>

            {/* Twin Crown Specific: Villa */}
            {farmhouse === "Twin Crown" && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Select Villa
                </label>
                <select
                  className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-gray-800 outline-none transition"
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
                  className="w-full border border-gray-300 p-2.5 rounded"
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
                  className="w-full border border-gray-300 p-2.5 rounded"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">CNIC</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2.5 rounded"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input
                  type="text"
                  placeholder="e.g. 18th June"
                  className="w-full border border-gray-300 p-2.5 rounded"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Slot</label>
              <input
                type="text"
                placeholder="e.g. 10 Hours 8pm to 6am"
                className="w-full border border-gray-300 p-2.5 rounded"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Resort Booking (PKR)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2.5 rounded"
                  value={bookingAmount || ""}
                  onChange={(e) => setBookingAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Advance (PKR)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2.5 rounded"
                  value={advanceAmount || ""}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-semibold mb-3">
                Special Instructions
              </label>
              {isGH ? (
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-green-700">
                    <input
                      type="radio"
                      name="instruction"
                      value="non AC"
                      onChange={(e) => setInstruction(e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />{" "}
                    non AC
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-green-700">
                    <input
                      type="radio"
                      name="instruction"
                      value="with one AC"
                      onChange={(e) => setInstruction(e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />{" "}
                    with one AC
                  </label>
                </div>
              ) : (
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                    <input
                      type="radio"
                      name="instruction"
                      value="none ac"
                      onChange={(e) => setInstruction(e.target.value)}
                      className="w-4 h-4 text-gray-900"
                    />{" "}
                    none ac
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                    <input
                      type="radio"
                      name="instruction"
                      value="two ac"
                      onChange={(e) => setInstruction(e.target.value)}
                      className="w-4 h-4 text-gray-900"
                    />{" "}
                    two ac
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              className={`w-full mt-6 text-white font-bold py-3 rounded transition shadow-md ${isGH ? "bg-green-700 hover:bg-green-800" : "bg-gray-900 hover:bg-black"}`}
            >
              Download Invoice PDF
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: INVOICE PREVIEW (Takes 8 columns) */}
        <div className="lg:col-span-8 overflow-auto flex justify-center items-start">
          <div
            id="invoice-capture"
            className="bg-white w-[210mm] max-w-[210mm] shadow-xl p-8 relative flex flex-col border border-gray-200"
          >
            {/* 1. Header: Background Image Only (No text, no dark overlay) */}
            <div className="relative h-44 rounded-xl overflow-hidden mb-6 shadow-md border border-gray-200 bg-gray-100">
              <img
                src={headerImage}
                alt={`${farmhouse} Background`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* 2. Title & QR Code */}
            <div
              className={`flex justify-between items-end mb-6 border-b-2 ${themeBorder} pb-4`}
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
              <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                <img
                  src={qrImage}
                  alt="QR Code"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>

            {/* 3. Customer Details (Bill To) */}
            <div
              className={`border border-gray-200 border-l-4 ${themeBorder} ${themeLightBg} p-5 mb-8 rounded-r-lg grid grid-cols-2 gap-y-4 gap-x-8 text-sm`}
            >
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                  Customer Name
                </span>
                <span className="font-bold text-gray-900 text-base">
                  {customerName || "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                  Phone Num
                </span>
                <span className="font-semibold text-gray-900">
                  {phone || "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                  CNIC
                </span>
                <span className="font-semibold text-gray-900">
                  {cnic || "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                  Date
                </span>
                <span className="font-semibold text-gray-900">
                  {date || "—"}
                </span>
              </div>

              {!isGH && (
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                    Villa
                  </span>
                  <span className="font-semibold text-gray-900">
                    {villa} Villa
                  </span>
                </div>
              )}

              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">
                  Slot
                </span>
                <span className="font-semibold text-gray-900">
                  {slot || "—"}
                </span>
              </div>
            </div>

            {/* 4. Professional Financial Table */}
            <table className="w-full mb-8 border-collapse border border-gray-300 text-sm shadow-sm">
              <thead className={`${themeBg}`}>
                <tr>
                  <th
                    className={`p-3 text-left font-bold uppercase tracking-wider border border-gray-300 w-2/3 ${headerTextClass}`}
                  >
                    Item Descriptions
                  </th>
                  <th
                    className={`p-3 text-right font-bold uppercase tracking-wider border border-gray-300 w-1/3 ${headerTextClass}`}
                  >
                    Amount (PKR)
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                <tr className="bg-white border-b border-gray-300">
                  <td className="p-3 font-semibold uppercase border-r border-gray-300 text-gray-700">
                    Resort Booking
                  </td>
                  <td className="p-3 text-right font-medium">
                    {bookingAmount.toLocaleString()}/-
                  </td>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <td className="p-3 font-semibold uppercase border-r border-gray-300 text-gray-700">
                    Advance
                  </td>
                  <td className="p-3 text-right font-medium text-red-600">
                    - {advanceAmount.toLocaleString()}/-
                  </td>
                </tr>
                <tr className="bg-white border-b border-gray-300">
                  <td className="p-3 font-semibold uppercase border-r border-gray-300 text-gray-700">
                    Tax
                  </td>
                  <td className="p-3 text-right font-medium text-gray-500">
                    0.00
                  </td>
                </tr>
                <tr className={`border-b-2 ${themeBorder} ${themeLightBg}`}>
                  <td
                    className={`p-4 font-bold uppercase text-base border-r border-gray-300 ${themeText}`}
                  >
                    Total Balance Due
                  </td>
                  <td
                    className={`p-4 text-right font-black text-lg ${themeText}`}
                  >
                    {balance.toLocaleString()}/-
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 5. Payment Details & Instructions */}
            <div className="mb-8 grid grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h3
                  className={`font-bold uppercase mb-3 text-sm flex items-center gap-2 ${themeText}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Payment Details
                </h3>
                {isGH ? (
                  <div className="text-sm space-y-1.5 text-gray-700">
                    <p>
                      <span className="font-bold text-gray-900">
                        Bank Name:
                      </span>{" "}
                      Bank OF Punjab
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">
                        Account No:
                      </span>{" "}
                      2050439779800019
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">Title:</span>{" "}
                      Green Haven Resort
                    </p>
                  </div>
                ) : (
                  <div className="text-sm space-y-1.5 text-gray-700">
                    <p>
                      <span className="font-bold text-gray-900">
                        Bank Name:
                      </span>{" "}
                      Bank Alfalah
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">
                        Account No:
                      </span>{" "}
                      55295002941161
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">IBAN No:</span>{" "}
                      PK77ALFH5529005002941161
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">Title:</span>{" "}
                      Twin Crown Resorts
                    </p>
                  </div>
                )}
              </div>

              {instruction && (
                <div
                  className={`${themeLightBg} border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-center`}
                >
                  <h3
                    className={`font-bold uppercase mb-2 text-sm ${themeText}`}
                  >
                    Special Instructions
                  </h3>
                  <p className="text-base font-bold text-gray-900 capitalize border-l-4 border-gray-400 pl-3 py-1">
                    {instruction}
                  </p>
                </div>
              )}
            </div>

            {/* Spacer to push footer down */}
            <div className="flex-grow"></div>

            {/* 6. Common Rules Section */}
            <div className="text-xs space-y-1 text-gray-600 mb-6 border-t-2 border-dashed border-gray-300 pt-5">
              <h4 className={`font-bold uppercase mb-2 ${themeText}`}>
                Terms & Conditions
              </h4>
              <ul className="list-disc pl-4 space-y-1 font-medium">
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
                  Drugs, weapons, and firing are strictly prohibited inside the
                  resort premises.
                </li>
                <li>
                  Check-in policy will be shared with all customers after
                  booking confirmation.
                </li>
                <li>
                  {farmhouse} reserves the right to modify policies without
                  prior notice.
                </li>
              </ul>
              <div className="mt-4 flex gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                <span>Facebook: @{farmhouse.replace(/\s+/g, "")}Resorts</span>
                <span>Instagram: @{farmhouse.replace(/\s+/g, "")}Resorts</span>
                <span>TikTok: @{farmhouse.replace(/\s+/g, "")}Resorts</span>
              </div>
              <div className="mt-1 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Official Supervisor: {isGH ? "Mr Ramesh" : "Junaid"} | Contact:{" "}
                {isGH ? "03432771861" : "0329-2026402"}
              </div>
            </div>

            {/* 7. Footer Text */}
            <div
              className={`text-center text-[11px] text-gray-600 border-t-2 ${themeBorder} pt-4 font-bold tracking-wide`}
            >
              {isGH ? (
                <p>
                  This is a computer-generated invoice and does not require a
                  signature. If you have any questions, please call or WhatsApp
                  us at our official number: 031 111 27 008.
                </p>
              ) : (
                <>
                  <p>
                    Thank you for choosing Twin Crown Resorts. This is a
                    computer-generated slip and does not require a signature.
                  </p>
                  <p className="mt-1">
                    For any queries, please contact our official resort number:
                    📞 +92 328 2329708
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
