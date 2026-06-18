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
  const [bookingAmount, setBookingAmount] = useState<number | "">("");
  const [discountedAmount, setDiscountedAmount] = useState<number | "">("");
  const [advanceAmount, setAdvanceAmount] = useState<number | "">("");

  // Farmhouse Specific State
  const [villa, setVilla] = useState("Platinum");
  const [instruction, setInstruction] = useState("");

  // --- Calculations ---
  const parsedBooking = Number(bookingAmount) || 0;
  const parsedDiscounted = Number(discountedAmount) || 0;
  const parsedAdvance = Number(advanceAmount) || 0;

  // Only apply discount if a valid discounted price is entered and it's less than the original
  const hasDiscount = parsedDiscounted > 0 && parsedDiscounted < parsedBooking;
  const discountValue = hasDiscount ? parsedBooking - parsedDiscounted : 0;
  
  // Calculate percentage: (Difference / Original) * 100
  const discountPercentage = hasDiscount ? ((discountValue / parsedBooking) * 100).toFixed(1) : "0.0";
  
  const finalBookingPrice = hasDiscount ? parsedDiscounted : parsedBooking;
  const balance = finalBookingPrice - parsedAdvance;

  // --- Dynamic Theming ---
  const isGH = farmhouse === "Green Haven";
  const themeBg = isGH ? "bg-green-700" : "bg-black";
  const themeText = isGH ? "text-green-700" : "text-black";
  const themeBorder = isGH ? "border-green-700" : "border-black";
  const themeLightBg = isGH ? "bg-green-50" : "bg-gray-100";
  const headerTextClass = isGH ? "text-white" : "text-yellow-500";

  // Images 
  const headerImage = isGH ? "/2.jpeg" : "/1.jpeg";
  const qrImage = isGH ? "/qrgh.png" : "/qrtc.png";

  const handleDownload = async () => {
    // Grab both pages
    const page1 = document.getElementById("invoice-page-1");
    const page2 = document.getElementById("invoice-page-2");
    
    if (!page1 || !page2) {
      console.error("Invoice elements not found!");
      return;
    }

    // Capture Page 1
    const canvas1 = await html2canvas(page1, { scale: 2, useCORS: true });
    const imgData1 = canvas1.toDataURL("image/jpeg", 0.98);

    // Capture Page 2
    const canvas2 = await html2canvas(page2, { scale: 2, useCORS: true });
    const imgData2 = canvas2.toDataURL("image/jpeg", 0.98);

    // Initialize PDF (A4 is exactly 210mm x 297mm)
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Add Page 1 perfectly sized to A4
    pdf.addImage(imgData1, "JPEG", 0, 0, 210, 297);

    // Add new page, then append Page 2 perfectly sized to A4
    pdf.addPage();
    pdf.addImage(imgData2, "JPEG", 0, 0, 210, 297);

    // Formatting the exact file name
    const fName = customerName ? customerName.replace(/\s+/g, "_") : "Customer";
    const fFarmhouse = farmhouse.replace(/\s+/g, ""); 
    const fDate = date ? date.replace(/\s+/g, "_") : "Date";
    const fSlot = slot ? slot.replace(/\s+/g, "_") : "Slot";

    const fileName = `${fName}_Invoice_${fFarmhouse}_${fDate}_${fSlot}.pdf`;

    pdf.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-8 font-sans text-gray-800 overflow-x-hidden">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-4 bg-white p-6 rounded-lg shadow-md h-fit lg:sticky lg:top-8 z-10">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">
            Invoice Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Select Farmhouse</label>
              <select
                className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={farmhouse}
                onChange={(e) => {
                  setFarmhouse(e.target.value);
                  setInstruction(""); 
                }}
              >
                <option value="Green Haven">Green Haven</option>
                <option value="Twin Crown">Twin Crown</option>
              </select>
            </div>

            {/* Twin Crown Specific: Villa */}
            {farmhouse === "Twin Crown" && (
              <div>
                <label className="block text-sm font-semibold mb-1">Select Villa</label>
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
                <label className="block text-sm font-semibold mb-1">Customer Name</label>
                <input type="text" className="w-full border border-gray-300 p-2.5 rounded" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone Num</label>
                <input type="text" className="w-full border border-gray-300 p-2.5 rounded" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">CNIC</label>
                <input type="text" className="w-full border border-gray-300 p-2.5 rounded" value={cnic} onChange={(e) => setCnic(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date</label>
                <input type="text" placeholder="e.g. 18th June" className="w-full border border-gray-300 p-2.5 rounded" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Slot</label>
              <input type="text" placeholder="e.g. 10 Hours 8pm to 6am" className="w-full border border-gray-300 p-2.5 rounded" value={slot} onChange={(e) => setSlot(e.target.value)} />
            </div>

            {/* Updated Pricing Section */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Orig. Booking (PKR)</label>
                <input type="number" className="w-full border border-gray-300 p-2.5 rounded" placeholder="e.g. 30000" value={bookingAmount} onChange={(e) => setBookingAmount(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-green-700">Discounted Price</label>
                <input type="number" className="w-full border border-gray-300 p-2.5 rounded" placeholder="Optional" value={discountedAmount} onChange={(e) => setDiscountedAmount(Number(e.target.value))} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Advance Received (PKR)</label>
                <input type="number" className="w-full border border-gray-300 p-2.5 rounded" value={advanceAmount} onChange={(e) => setAdvanceAmount(Number(e.target.value))} />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="border-t pt-4 mt-4">
              <label className="block text-sm font-semibold mb-3">Special Instructions</label>
              {isGH ? (
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-green-700">
                    <input type="radio" name="instruction" value="non AC" onChange={(e) => setInstruction(e.target.value)} className="w-4 h-4 text-green-600" /> non AC
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-green-700">
                    <input type="radio" name="instruction" value="with one AC" onChange={(e) => setInstruction(e.target.value)} className="w-4 h-4 text-green-600" /> with one AC
                  </label>
                </div>
              ) : (
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                    <input type="radio" name="instruction" value="none ac" onChange={(e) => setInstruction(e.target.value)} className="w-4 h-4 text-gray-900" /> none ac
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                    <input type="radio" name="instruction" value="two ac" onChange={(e) => setInstruction(e.target.value)} className="w-4 h-4 text-gray-900" /> two ac
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              className={`w-full mt-6 text-white font-bold py-3.5 rounded transition shadow-md ${isGH ? "bg-green-700 hover:bg-green-800" : "bg-gray-900 hover:bg-black"}`}
            >
              Generate 2-Page PDF
            </button>
            
            {/* Mobile Only Message */}
            <p className="text-center text-xs text-gray-500 lg:hidden mt-4">
              Scroll horizontally below to view the full A4 invoice preview.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: INVOICE PREVIEWS (2 Pages) */}
        {/* overflow-x-auto allows the A4 pages to retain their exact size on small mobile screens without breaking the site layout */}
        <div className="lg:col-span-8 w-full overflow-x-auto pb-12">
          <div className="flex flex-col items-center gap-8 min-w-[210mm]">
            
            {/* ======================= PAGE 1 ======================= */}
            <div
              id="invoice-page-1"
              className="bg-white w-[210mm] min-w-[210mm] h-[297mm] shadow-xl p-8 relative flex flex-col border border-gray-200"
            >
              {/* Header: Background Image Only (No text) */}
              <div className="relative h-[176px] w-full rounded-xl overflow-hidden mb-6 shadow-md border border-gray-200 bg-gray-100 shrink-0">
                <img src={headerImage} alt="Farmhouse Background" className="absolute inset-0 w-full h-full object-cover" />
              </div>

              {/* Title & QR Code */}
              <div className={`flex justify-between items-end mb-6 border-b-2 ${themeBorder} pb-4 shrink-0`}>
                <div>
                  <h2 className={`text-4xl font-black uppercase tracking-widest ${themeText}`}>Invoice</h2>
                  <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">Official Booking Document</p>
                </div>
                <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                  <img src={qrImage} alt="QR Code" className="w-16 h-16 object-contain" />
                </div>
              </div>

              {/* Customer Details */}
              <div className={`border border-gray-200 border-l-4 ${themeBorder} ${themeLightBg} p-5 mb-8 rounded-r-lg grid grid-cols-2 gap-y-4 gap-x-8 text-sm shrink-0`}>
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">Customer Name</span>
                  <span className="font-bold text-gray-900 text-base">{customerName || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">Phone Num</span>
                  <span className="font-semibold text-gray-900">{phone || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">CNIC</span>
                  <span className="font-semibold text-gray-900">{cnic || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">Date</span>
                  <span className="font-semibold text-gray-900">{date || "—"}</span>
                </div>
                {!isGH && (
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">Villa</span>
                    <span className="font-semibold text-gray-900">{villa} Villa</span>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-0.5">Slot</span>
                  <span className="font-semibold text-gray-900">{slot || "—"}</span>
                </div>
              </div>

              {/* Financial Table */}
              <table className="w-full mb-8 border-collapse border border-gray-300 text-sm shadow-sm shrink-0">
                <thead className={`${themeBg}`}>
                  <tr>
                    <th className={`p-3 text-left font-bold uppercase tracking-wider border border-gray-300 w-2/3 ${headerTextClass}`}>Item Descriptions</th>
                    <th className={`p-3 text-right font-bold uppercase tracking-wider border border-gray-300 w-1/3 ${headerTextClass}`}>Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="bg-white border-b border-gray-300">
                    <td className="p-3 font-semibold uppercase border-r border-gray-300 text-gray-700">Resort Booking</td>
                    <td className="p-3 text-right font-medium">{parsedBooking.toLocaleString()}/-</td>
                  </tr>
                  
                  {/* Dynamic Discount Row */}
                  {hasDiscount && (
                    <tr className="bg-green-50 border-b border-gray-300">
                      <td className="p-3 font-semibold uppercase border-r border-gray-300 text-green-700">
                        Discount ({discountPercentage}%)
                      </td>
                      <td className="p-3 text-right font-bold text-green-700">
                        - {discountValue.toLocaleString()}/-
                      </td>
                    </tr>
                  )}

                  <tr className="bg-red-50 border-b border-gray-300">
                    <td className="p-3 font-semibold uppercase border-r border-gray-300 text-gray-700">Advance Paid</td>
                    <td className="p-3 text-right font-medium text-red-600">- {parsedAdvance.toLocaleString()}/-</td>
                  </tr>
                  <tr className="bg-white border-b border-gray-300">
                    <td className="p-3 font-semibold uppercase border-r border-gray-300 text-gray-700">Tax</td>
                    <td className="p-3 text-right font-medium text-gray-500">0.00</td>
                  </tr>
                  <tr className={`border-b-2 ${themeBorder} ${themeLightBg}`}>
                    <td className={`p-4 font-bold uppercase text-base border-r border-gray-300 ${themeText}`}>Total Balance Due</td>
                    <td className={`p-4 text-right font-black text-lg ${themeText}`}>{balance.toLocaleString()}/-</td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Details & Instructions */}
              <div className="grid grid-cols-2 gap-8 shrink-0">
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <h3 className={`font-bold uppercase mb-3 text-sm flex items-center gap-2 ${themeText}`}>
                    Payment Details
                  </h3>
                  {isGH ? (
                    <div className="text-sm space-y-1.5 text-gray-700">
                      <p><span className="font-bold text-gray-900">Bank Name:</span> Bank OF Punjab</p>
                      <p><span className="font-bold text-gray-900">Account No:</span> 2050439779800019</p>
                      <p><span className="font-bold text-gray-900">IBAN No:</span> PK56BPUN2050439779800019</p>
                      <p><span className="font-bold text-gray-900">Title:</span> Green Haven Resort</p>
                    </div>
                  ) : (
                    <div className="text-sm space-y-1.5 text-gray-700">
                      <p><span className="font-bold text-gray-900">Bank Name:</span> Bank Alfalah</p>
                      <p><span className="font-bold text-gray-900">Account No:</span> 55295002941161</p>
                      <p><span className="font-bold text-gray-900">IBAN No:</span> PK77ALFH5529005002941161</p>
                      <p><span className="font-bold text-gray-900">Title:</span> Twin Crown Resorts</p>
                    </div>
                  )}
                </div>

                {instruction && (
                  <div className={`${themeLightBg} border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col justify-center`}>
                    <h3 className={`font-bold uppercase mb-2 text-sm ${themeText}`}>Special Instructions</h3>
                    <p className="text-base font-bold text-gray-900 capitalize border-l-4 border-gray-400 pl-3 py-1">{instruction}</p>
                  </div>
                )}
              </div>
              
              {/* Page Number indicator at bottom */}
              <div className="mt-auto text-center text-xs text-gray-400">Page 1 of 2</div>
            </div>


            {/* ======================= PAGE 2 ======================= */}
            <div
              id="invoice-page-2"
              className="bg-white w-[210mm] min-w-[210mm] h-[297mm] shadow-xl p-8 relative flex flex-col border border-gray-200"
            >
              {/* Subtle Page 2 Header */}
              <div className={`mb-8 border-b-2 ${themeBorder} pb-4`}>
                <h2 className={`text-2xl font-black uppercase tracking-widest ${themeText}`}>{farmhouse}</h2>
                <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">Policies & Terms</p>
              </div>

              {/* Terms Section */}
              <div className="mb-8">
                <h4 className={`font-bold uppercase mb-4 text-lg ${themeText}`}>Terms & Conditions</h4>
                <ul className="list-disc pl-6 space-y-3 font-medium text-sm text-gray-700">
                  <li>All payments are non-refundable after confirmation.</li>
                  <li>Please carry a valid ID at check-in.</li>
                  <li>Any damage to resort property will be charged accordingly.</li>
                  <li>Early check-in & late check-out are subject to availability.</li>
                  <li>Guests are requested to maintain a peaceful and family-friendly environment.</li>
                  <li>Outside food is allowed.</li>
                  <li>Drugs, weapons, and firing are strictly prohibited inside the resort premises.</li>
                  <li>Check-in policy will be shared with all customers after booking confirmation.</li>
                  <li>{farmhouse} reserves the right to modify policies without prior notice.</li>
                </ul>
              </div>

              {/* Socials & Supervisor Box */}
              <div className={`mt-8 ${themeLightBg} border border-gray-200 rounded-lg p-6`}>
                <div className="flex gap-6 text-xs font-bold text-gray-700 uppercase tracking-wide justify-center mb-4">
                  <span>Facebook: @{farmhouse.replace(/\s+/g, "")}Resorts</span>
                  <span>Instagram: @{farmhouse.replace(/\s+/g, "")}Resorts</span>
                  <span>TikTok: @{farmhouse.replace(/\s+/g, "")}Resorts</span>
                </div>
                <div className="text-center text-sm font-bold text-gray-900 uppercase tracking-wider pt-4 border-t border-gray-300">
                  Official Supervisor: {isGH ? "Mr Ramesh" : "Junaid"} | Contact: {isGH ? "03432771861" : "0329-2026402"}
                </div>
              </div>

              {/* Spacer to keep footer at the bottom of Page 2 */}
              <div className="flex-grow"></div>

              {/* Footer Text */}
              <div className={`text-center text-xs text-gray-600 border-t-2 ${themeBorder} pt-6 font-bold tracking-wide`}>
                {isGH ? (
                  <p>This is a computer-generated invoice and does not require a signature. If you have any questions, please call or WhatsApp us at our official number: 031 111 27 008.</p>
                ) : (
                  <>
                    <p>Thank you for choosing Twin Crown Resorts. This is a computer-generated slip and does not require a signature.</p>
                    <p className="mt-1">For any queries, please contact our official resort number: 📞 +92 328 2329708</p>
                  </>
                )}
              </div>
              
              {/* Page Number indicator */}
              <div className="mt-6 text-center text-xs text-gray-400">Page 2 of 2</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}