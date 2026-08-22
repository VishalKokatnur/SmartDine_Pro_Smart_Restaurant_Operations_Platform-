
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";
import "./TablesPage.css";
import "./BillingPage.css";
import "./RoomBookingPage.css";

const API_URL = "https://smartdine-pro-smart-restaurant.onrender.com/api/hotel";

// ---- Configure your real UPI details here (same as Billing page) ----
const MERCHANT_UPI_ID = "7483251136@ybl"; // <-- replace with your real UPI ID
const MERCHANT_NAME = "SmartDine Pro";
// -----------------------------------------------------------------------

const EMPTY_FORM = {
  room: "",
  guest_name: "",
  guest_phone: "",
  guest_email: "",
  check_in_date: "",
  check_in_time: "",
  check_out_date: "",
  check_out_time: "",
  number_of_guests: "",
  notes: "",
  booking_status: "Booked",
  payment_method: "Cash",
  amount_paid: "",
};

function RoomBookingPage() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [payModal, setPayModal] = useState(null); // booking being paid
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extra guard against double-booking from double-clicking "Book Room" (or
  // any other rapid double-submit). React state updates (isSubmitting) are
  // not always applied fast enough to block a near-instant second click, so
  // we also keep a plain ref that updates synchronously the instant the
  // first click is handled.
  const isSubmittingRef = useRef(false);

  // Payment (at time of booking) confirmation for UPI/Online advance payments
  const [bookingPaymentConfirmed, setBookingPaymentConfirmed] = useState(false);
  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms/`);
      setRooms(res.data);
    } catch (error) {
      console.error("Rooms fetch error:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/`);
      setBookings(res.data);
    } catch (error) {
      console.error("Bookings fetch error:", error);
      alert("Failed to load room bookings");
    }
  };

  const getBackendErrorMessage = (error) => {
    const data = error.response?.data;

    if (!data) return "Something went wrong";
    if (typeof data === "string") return data;

    for (const key of [
      "room",
      "check_out_date",
      "check_in_date",
      "guest_name",
      "guest_phone",
      "number_of_guests",
      "amount",
      "detail",
    ]) {
      if (data[key]) {
        return Array.isArray(data[key]) ? data[key][0] : data[key];
      }
    }

    return JSON.stringify(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Any change to the payment method or advance amount invalidates a
    // previously confirmed UPI/Online payment for this form.
    if (e.target.name === "payment_method" || e.target.name === "amount_paid") {
      setBookingPaymentConfirmed(false);
    }
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, guest_phone: digitsOnly });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setBookingPaymentConfirmed(false);
  };

  const selectedRoom = rooms.find(
    (r) => String(r.id) === String(formData.room)
  );

  const nights = useMemo(() => {
    if (!formData.check_in_date || !formData.check_out_date) return 0;
    const inDate = new Date(formData.check_in_date);
    const outDate = new Date(formData.check_out_date);
    const diff = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [formData.check_in_date, formData.check_out_date]);

  const estimatedTotal = useMemo(() => {
    if (!selectedRoom || !nights) return 0;
    return nights * Number(selectedRoom.price_per_day);
  }, [selectedRoom, nights]);

  // Rooms available to pick: currently Available, or the room already
  // attached to the booking being edited (so editing doesn't lose it).
    // Rooms available to pick: any room that isn't flagged Maintenance/
  // Cleaning (those are physically unusable regardless of dates), or the
  // room already attached to the booking being edited (so editing doesn't
  // lose it). A room showing "Booked"/"Occupied" overall can still have
  // free dates for a NEW stay - the real date-clash check happens on
  // submit (has_overlapping_booking on the backend), and the staff also
  // gets a heads-up notice below the dropdown before they even try.
  const UNAVAILABLE_ROOM_STATUSES = ["Maintenance", "Cleaning"];

  const availableRoomOptions = rooms.filter(
    (r) =>
      !UNAVAILABLE_ROOM_STATUSES.includes(r.status) ||
      String(r.id) === String(formData.room)
  );

  // Existing "Booked"/"Checked In" bookings for the currently selected
  // room, so staff can see at a glance which dates are already taken
  // before they even try to submit.
  const selectedRoomActiveBookings = useMemo(() => {
    if (!formData.room) return [];

    return bookings
      .filter(
        (b) =>
          String(b.room) === String(formData.room) &&
          ["Booked", "Checked In"].includes(b.booking_status) &&
          b.id !== editingId
      )
      .sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date));
  }, [bookings, formData.room, editingId]);

  const advanceAmount = Number(formData.amount_paid) || 0;

    const getBookingUpiQrUrl = () => {
    // Use whichever amount is known right now - the advance the staff typed
    // in, otherwise the estimated total for the stay. If neither is known
    // yet, the QR still works: the guest's UPI app will just ask them to
    // type the amount in manually (same as scanning any static shop QR).
    const knownAmount = advanceAmount > 0 ? advanceAmount : estimatedTotal;

    const note = formData.guest_name
      ? `Room Booking - ${formData.guest_name}`
      : "SmartDine Pro Room Booking";

    let upiUri =
      `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}` +
      `&pn=${encodeURIComponent(MERCHANT_NAME)}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(note)}`;

    if (knownAmount > 0) {
      upiUri += `&am=${knownAmount.toFixed(2)}`;
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
      upiUri
    )}`;
  };
    const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard against double-click / double-submit, which is what lets two
    // bookings for the same room + same dates slip through as a race
    // condition before the server even gets to respond to the first one.
    // The ref check/set happens synchronously (unlike the isSubmitting
    // state update), so it also blocks a second click that lands before
    // React has re-rendered the disabled button.
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    isSubmittingRef.current = true;

    try {
      if (!formData.room) {
        alert("Please select a room");
        return;
      }

      if (!formData.guest_name.trim()) {
        alert("Please enter guest name");
        return;
      }

      if (formData.guest_phone.length !== 10) {
        alert("Phone number must be exactly 10 digits");
        return;
      }

      if (!formData.check_in_date || !formData.check_out_date) {
        alert("Please select check-in and check-out dates");
        return;
      }

      if (nights <= 0) {
        alert("Check-out date must be after check-in date");
        return;
      }

      if (
        !formData.number_of_guests ||
        Number(formData.number_of_guests) <= 0
      ) {
        alert("Please enter number of guests");
        return;
      }

      if (
        selectedRoom &&
        Number(formData.number_of_guests) > Number(selectedRoom.capacity)
      ) {
        alert(
          `This room can only accommodate ${selectedRoom.capacity} guest(s).`
        );
        return;
      }

      if (advanceAmount < 0) {
        alert("Advance amount cannot be negative");
        return;
      }

      if (advanceAmount > estimatedTotal) {
        alert("Advance amount cannot be more than the estimated total");
        return;
      }

      if (
        !editingId &&
        (formData.payment_method === "UPI" || formData.payment_method === "Online") &&
        advanceAmount > 0 &&
        !bookingPaymentConfirmed
      ) {
        alert("Please confirm the payment before saving the booking.");
        return;
      }

      const payload = {
        room: Number(formData.room),
        guest_name: formData.guest_name.trim(),
        guest_phone: formData.guest_phone,
        guest_email: formData.guest_email.trim() || null,
        check_in_date: formData.check_in_date,
        check_in_time: formData.check_in_time || null,
        check_out_date: formData.check_out_date,
        check_out_time: formData.check_out_time || null,
        number_of_guests: Number(formData.number_of_guests),
        total_amount: estimatedTotal,
        booking_status: formData.booking_status,
        notes: formData.notes.trim() || null,
        payment_method: formData.payment_method,
      };

      // Only send an advance amount when creating a NEW booking. On edits we
      // leave amount_paid untouched here so we never overwrite payments that
      // were already recorded through the "Pay" button/modal.
      if (!editingId) {
        payload.amount_paid = advanceAmount;
      }

      await submitBookingPayload(payload);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const submitBookingPayload = async (payload) => {
    setIsSubmitting(true);

    try {
      if (editingId) {
        await axios.put(`${API_URL}/bookings/${editingId}/`, payload);
        alert("Booking updated successfully");
      } else {
        await axios.post(`${API_URL}/bookings/`, payload);
        alert(
          advanceAmount > 0
            ? "Room booked successfully. Advance payment recorded."
            : "Room booked successfully"
        );
      }

      resetForm();
      fetchBookings();
      fetchRooms();
    } catch (error) {
      console.error("Booking save error:", error);
      alert(getBackendErrorMessage(error));
      // A failed booking (e.g. "room already booked") means the room list
      // shown in the dropdown may be stale — refresh it so the user sees
      // accurate availability right away.
      fetchRooms();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);

    setFormData({
      room: booking.room,
      guest_name: booking.guest_name,
      guest_phone: booking.guest_phone,
      guest_email: booking.guest_email || "",
      check_in_date: booking.check_in_date,
      check_in_time: booking.check_in_time || "",
      check_out_date: booking.check_out_date,
      check_out_time: booking.check_out_time || "",
      number_of_guests: booking.number_of_guests,
      notes: booking.notes || "",
      booking_status: booking.booking_status,
      payment_method: booking.payment_method || "Cash",
      // Advance amount is left blank while editing - use the "Pay" button
      // on the booking to record additional payments instead.
      amount_paid: "",
    });

    setBookingPaymentConfirmed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateStatus = async (booking, newStatus) => {
    if (
      newStatus === "Cancelled" &&
      !window.confirm(`Cancel booking for ${booking.guest_name}?`)
    ) {
      return;
    }

    try {
      await axios.put(`${API_URL}/bookings/${booking.id}/`, {
        ...booking,
        booking_status: newStatus,
      });
      fetchBookings();
      fetchRooms();
    } catch (error) {
      console.error("Status update error:", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const handleDelete = async (booking) => {
    const confirmed = window.confirm(
      `Delete booking for ${booking.guest_name}?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/bookings/${booking.id}/`);
      alert("Booking deleted");
      fetchBookings();
      fetchRooms();
    } catch (error) {
      console.error("Booking delete error:", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const openPayModal = (booking) => {
    setPayModal(booking);
    setPayAmount("");
    setPayMethod(booking.payment_method || "Cash");
  };

  const closePayModal = () => {
    setPayModal(null);
    setPayAmount("");
  };

  const submitPayment = async () => {
    const amount = Number(payAmount);

    if (!amount || amount <= 0) {
      alert("Enter a valid payment amount");
      return;
    }

    try {
      await axios.post(`${API_URL}/bookings/${payModal.id}/pay/`, {
        amount,
        payment_method: payMethod,
      });
      alert("Payment recorded successfully");
      closePayModal();
      fetchBookings();
    } catch (error) {
      console.error("Payment error:", error);
      alert(getBackendErrorMessage(error));
    }
  };

  // --------------------------------------------------------------
  // ROOM BILLING (separate "Bill / Invoice" panel for room bookings)
  // --------------------------------------------------------------
  const [billModal, setBillModal] = useState(null); // booking being billed
  const [billAmount, setBillAmount] = useState("");
  const [billMethod, setBillMethod] = useState("Cash");
  const [billConfirmed, setBillConfirmed] = useState(false);
  const [billSubmitting, setBillSubmitting] = useState(false);

  const openBillModal = (booking) => {
    const due = Number(booking.balance_due || 0);
    setBillModal(booking);
    setBillAmount(due > 0 ? due : "");
    setBillMethod(booking.payment_method || "Cash");
    setBillConfirmed(false);
  };

  const closeBillModal = () => {
    setBillModal(null);
    setBillAmount("");
    setBillConfirmed(false);
  };

  const getBillUpiQrUrl = () => {
    const amt = Number(billAmount) > 0 ? Number(billAmount).toFixed(2) : "0.00";
    const note = billModal
      ? `Room Bill - ${billModal.guest_name} - Room ${billModal.room_number}`
      : "SmartDine Pro Room Bill";

    const upiUri =
      `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}` +
      `&pn=${encodeURIComponent(MERCHANT_NAME)}` +
      `&am=${amt}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(note)}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
      upiUri
    )}`;
  };

  const submitBillPayment = async () => {
    if (!billModal) return;

    const due = Number(billModal.balance_due || 0);
    const amount = Number(billAmount) || 0;

    if (due <= 0) {
      alert("This booking is already fully paid.");
      return;
    }

    if (amount <= 0) {
      alert("Enter a valid payment amount");
      return;
    }

    if (amount > due) {
      alert("Amount cannot be more than the balance due");
      return;
    }

    if (
      (billMethod === "UPI" || billMethod === "Online") &&
      !billConfirmed
    ) {
      alert("Please confirm the payment before recording it.");
      return;
    }

    try {
      setBillSubmitting(true);

      const response = await axios.post(
        `${API_URL}/bookings/${billModal.id}/pay/`,
        { amount, payment_method: billMethod }
      );

      alert("Payment recorded successfully");

      // Keep the invoice modal open with fresh numbers so the user can
      // immediately print the updated invoice.
      setBillModal(response.data);
      setBillAmount("");
      setBillConfirmed(false);
      fetchBookings();
    } catch (error) {
      console.error("Bill payment error:", error);
      alert(getBackendErrorMessage(error));
    } finally {
      setBillSubmitting(false);
    }
  };

  const printRoomInvoice = () => {
    if (!billModal) return;

    const b = billModal;
    const total = Number(b.total_amount || 0);
    const paid = Number(b.amount_paid || 0);
    const balance = Number(b.balance_due || 0);
    const rate = Number(b.price_per_day || 0);
    const nights = Number(b.nights || 0);

    const invoiceHtml = `
      <html>
        <head>
          <title>Room Invoice - ${b.guest_name}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 32px;
              color: #2b2118;
            }
            h1 { margin: 0 0 4px; font-size: 24px; }
            h2 { margin: 12px 0; font-size: 16px; letter-spacing: 1px; }
            .center { text-align: center; }
            .muted { color: #6b6055; font-size: 13px; margin: 2px 0; }
            .details {
              display: flex;
              justify-content: space-between;
              margin: 18px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th, td {
              border-bottom: 1px solid #ddd;
              text-align: left;
              padding: 8px;
              font-size: 14px;
            }
            .totals {
              margin-top: 16px;
              text-align: right;
              font-size: 14px;
            }
            .totals p { margin: 4px 0; }
            .totals h2 { font-size: 18px; }
            .footer {
              margin-top: 28px;
              text-align: center;
              font-size: 13px;
              color: #6b6055;
            }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>SmartDine Pro</h1>
            <p class="muted">Premium Restaurant &amp; Hotel Management</p>
            <p class="muted">GSTIN: 29ABCDE1234F1Z5</p>
            <h2>ROOM INVOICE</h2>
          </div>

          <div class="details">
            <div>
              <p><strong>Bill No:</strong> #${b.id}</p>
              <p><strong>Guest:</strong> ${b.guest_name}</p>
              <p><strong>Phone:</strong> ${b.guest_phone || "-"}</p>
            </div>
            <div>
              <p><strong>Room:</strong> ${b.room_number} (${b.room_type})</p>
              <p><strong>Check-In:</strong> ${b.check_in_date}${
      b.check_in_time ? " · " + b.check_in_time : ""
    }</p>
              <p><strong>Check-Out:</strong> ${b.check_out_date}${
      b.check_out_time ? " · " + b.check_out_time : ""
    }</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Nights</th>
                <th>Rate/Night</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Charges - ${b.room_type}</td>
                <td>${nights}</td>
                <td>₹${rate.toFixed(2)}</td>
                <td>₹${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <p>Total Amount: <strong>₹${total.toFixed(2)}</strong></p>
            <p>Amount Paid: <strong>₹${paid.toFixed(2)}</strong></p>
            <h2>Balance Due: ₹${balance.toFixed(2)}</h2>
            <p>Payment Mode: ${b.payment_method || "-"}</p>
            <p>Payment Status: ${b.payment_status}</p>
          </div>

          <div class="footer">
            <p>Thank You! Visit Again</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice.");
      return;
    }

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();

    // Give the new window a brief moment to render before printing.
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const filteredBookings = bookings.filter((b) => {
    const keyword = search.toLowerCase();
    return (
      b.guest_name?.toLowerCase().includes(keyword) ||
      b.guest_phone?.toLowerCase().includes(keyword) ||
      String(b.room_number || "").toLowerCase().includes(keyword) ||
      b.booking_status?.toLowerCase().includes(keyword) ||
      b.payment_status?.toLowerCase().includes(keyword)
    );
  });

  const bookingStatusClass = (status) => {
    if (status === "Booked") return "rb-badge rb-booked";
    if (status === "Checked In") return "rb-badge rb-checkedin";
    if (status === "Checked Out") return "rb-badge rb-checkedout";
    if (status === "Cancelled") return "rb-badge rb-cancelled";
    return "rb-badge";
  };

  const paymentStatusClass = (status) => {
    if (status === "Paid") return "rb-badge rb-paid";
    if (status === "Partial") return "rb-badge rb-partial";
    return "rb-badge rb-unpaid";
  };

  return (
    <RestaurantLayout>
      <div className="page-box tables-page-box">
        <div className="page-header">
          <div>
            <h1>Room Bookings</h1>
            <p>
              Book rooms for guests, track check-in/check-out and record
              payments.
            </p>
          </div>
        </div>

        {/* BOOKING FORM */}
        <form className="table-form rb-form" onSubmit={handleSubmit}>
          <div className="table-field">
            <label>Room</label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
              required
            >
              <option value="">Select Room</option>
              {availableRoomOptions.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_number} · {room.room_type} · Up to{" "}
                  {room.capacity} guests · ₹{room.price_per_day}/day
                </option>
              ))}
            </select>
          </div>

          {selectedRoomActiveBookings.length > 0 && (
            <div
              className="payment-info rb-room-booked-notice"
              style={{ flex: "1 1 100%" }}
            >
              <p>
                ⚠️ This room already has {selectedRoomActiveBookings.length}{" "}
                active booking
                {selectedRoomActiveBookings.length > 1 ? "s" : ""}:
              </p>
              <ul>
                {selectedRoomActiveBookings.map((b) => (
                  <li key={b.id}>
                    {b.check_in_date}
                    {b.check_in_time ? ` ${b.check_in_time}` : ""}
                    {" → "}
                    {b.check_out_date}
                    {b.check_out_time ? ` ${b.check_out_time}` : ""}
                    {" · "}
                    {b.guest_name}
                  </li>
                ))}
              </ul>
              <p>Pick dates outside these ranges, or choose a different room.</p>
            </div>
          )}

          <div className="table-field">
            <label>Guest Name</label>
            <input
              name="guest_name"
              placeholder="Full name"
              value={formData.guest_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="table-field">
            <label>Phone</label>
            <input
              name="guest_phone"
              placeholder="10 digit phone"
              value={formData.guest_phone}
              onChange={handlePhoneChange}
              inputMode="numeric"
              maxLength={10}
              required
            />
          </div>

          <div className="table-field">
            <label>Email (optional)</label>
            <input
              type="email"
              name="guest_email"
              placeholder="guest@email.com"
              value={formData.guest_email}
              onChange={handleChange}
            />
          </div>

          <div className="table-field">
            <label>Check-In Date</label>
            <input
              type="date"
              name="check_in_date"
              value={formData.check_in_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="table-field">
            <label>Check-In Time</label>
            <input
              type="time"
              name="check_in_time"
              value={formData.check_in_time}
              onChange={handleChange}
            />
          </div>

          <div className="table-field">
            <label>Check-Out Date</label>
            <input
              type="date"
              name="check_out_date"
              value={formData.check_out_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="table-field">
            <label>Check-Out Time</label>
            <input
              type="time"
              name="check_out_time"
              value={formData.check_out_time}
              onChange={handleChange}
            />
          </div>

          <div className="table-field">
            <label>Number of Guests</label>
            <input
              type="number"
              name="number_of_guests"
              placeholder="Example: 2"
              value={formData.number_of_guests}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="table-field">
            <label>Booking Status</label>
            <select
              name="booking_status"
              value={formData.booking_status}
              onChange={handleChange}
            >
              <option value="Booked">Booked</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="table-field">
            <label>Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {!editingId && (
            <div className="table-field">
              <label>Advance Paid Now (optional)</label>
              <input
                type="number"
                name="amount_paid"
                min="0"
                placeholder="0"
                value={formData.amount_paid}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="table-field" style={{ flex: "1 1 260px" }}>
            <label>Notes (optional)</label>
            <input
              name="notes"
              placeholder="Special requests, ID proof, etc."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {!editingId && formData.payment_method === "Cash" && (
            <div className="payment-info" style={{ flex: "1 1 100%" }}>
              <p>💵 Collect cash from the guest at check-in / the front desk.</p>
            </div>
          )}

          {!editingId && formData.payment_method === "Card" && (
            <div className="payment-info" style={{ flex: "1 1 100%" }}>
              <p>💳 Swipe or tap the guest's debit/credit card on the POS terminal.</p>
            </div>
          )}

          {!editingId && formData.payment_method === "Online" && (
            <div className="payment-info" style={{ flex: "1 1 100%" }}>
              <p>🌐 Guest can pay through your online payment gateway link.</p>
            </div>
          )}

                    {!editingId &&
            (formData.payment_method === "UPI" ||
              formData.payment_method === "Online") && (
              <div className="payment-qr-card">
                <div className="payment-qr-image-wrap">
                  <img
                    src={getBookingUpiQrUrl()}
                    alt="Scan to pay"
                    className="payment-qr-image"
                  />
                </div>

                <div className="payment-qr-details">
                  <span className="payment-qr-badge">Scan & Pay</span>
                  <h3>Scan & Pay</h3>
                  <p>Google Pay • PhonePe • Paytm • BHIM • Any UPI App</p>

                  <div className="payment-qr-amount">
                    <span>Amount</span>
                    <strong>
                      {advanceAmount > 0
                        ? `₹${advanceAmount.toFixed(2)}`
                        : estimatedTotal > 0
                        ? `₹${estimatedTotal.toFixed(2)}`
                        : "Enter amount in your UPI app"}
                    </strong>
                  </div>

                  <div className="payment-qr-upi-id">
                    UPI ID: <strong>{MERCHANT_UPI_ID}</strong>
                  </div>

                  <div className="payment-status-box">
                    <h4>Payment Status</h4>
                    {bookingPaymentConfirmed ? (
                      <span className="payment-success">
                        ✅ Payment Received
                      </span>
                    ) : (
                      <span className="payment-pending">
                        ⏳ Waiting for guest payment...
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="confirm-payment-btn"
                    disabled={bookingPaymentConfirmed}
                    onClick={() => {
                      setBookingPaymentConfirmed(true);
                      alert("Payment Confirmed Successfully");
                    }}
                  >
                    {bookingPaymentConfirmed
                      ? "✅ Payment Confirmed"
                      : "✅ Confirm Payment"}
                  </button>
                </div>
              </div>
            )}

          <div className="rb-total-box">
            <span>Nights</span>
            <strong>{nights}</strong>
            <span>Estimated Total</span>
            <strong>₹{estimatedTotal.toLocaleString("en-IN")}</strong>
          </div>

          <div className="table-field button-field">
            <button
              type="submit"
              className="table-save-btn"
              disabled={
                isSubmitting ||
                (!editingId &&
                  (formData.payment_method === "UPI" ||
                    formData.payment_method === "Online") &&
                  advanceAmount > 0 &&
                  !bookingPaymentConfirmed)
              }
            >
              {isSubmitting
                ? "Saving..."
                : editingId
                ? "Update Booking"
                : "+ Book Room"}
            </button>
          </div>

          {editingId && (
            <div className="table-field button-field">
              <button
                type="button"
                className="table-cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            </div>
          )}
        </form>

        {/* SEARCH */}
        <input
          type="text"
          className="table-search-input"
          placeholder="Search guest, phone, room or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* BOOKING HISTORY */}
        <table className="premium-table rb-history-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Guests</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="11">No room bookings found.</td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td className="item-name">
                    👤 {b.guest_name}
                    <br />
                    <small>{b.guest_phone}</small>
                  </td>

                  <td>
                    🛏️ {b.room_number}
                    <br />
                    <small>{b.room_type}</small>
                  </td>

                  <td>
                    {b.check_in_date}
                    {b.check_in_time ? ` · ${b.check_in_time}` : ""}
                  </td>

                  <td>
                    {b.check_out_date}
                    {b.check_out_time ? ` · ${b.check_out_time}` : ""}
                  </td>

                  <td>{b.number_of_guests}</td>

                  <td>₹{Number(b.total_amount || 0).toLocaleString("en-IN")}</td>

                  <td>₹{Number(b.amount_paid || 0).toLocaleString("en-IN")}</td>

                  <td>₹{Number(b.balance_due || 0).toLocaleString("en-IN")}</td>

                  <td>
                    <span className={paymentStatusClass(b.payment_status)}>
                      {b.payment_status}
                    </span>
                  </td>

                  <td>
                    <span className={bookingStatusClass(b.booking_status)}>
                      {b.booking_status}
                    </span>
                  </td>

                  <td className="rb-actions">
                    {b.booking_status === "Booked" && (
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => updateStatus(b, "Checked In")}
                      >
                        Check In
                      </button>
                    )}

                    {b.booking_status === "Checked In" && (
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => updateStatus(b, "Checked Out")}
                      >
                        Check Out
                      </button>
                    )}

                    {Number(b.balance_due) > 0 &&
                      b.booking_status !== "Cancelled" && (
                        <button
                          type="button"
                          className="table-save-btn rb-pay-btn"
                          onClick={() => openPayModal(b)}
                        >
                          Pay
                        </button>
                      )}

                    <button
                      type="button"
                      className="edit-btn rb-bill-btn"
                      onClick={() => openBillModal(b)}
                    >
                      🧾 Bill
                    </button>

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEdit(b)}
                    >
                      Edit
                    </button>

                    {["Booked", "Checked In"].includes(b.booking_status) && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => updateStatus(b, "Cancelled")}
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(b)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAYMENT MODAL */}
      {payModal && (
        <div className="tq-overlay" onClick={closePayModal}>
          <div className="tq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tq-modal-head">
              <h2>Record Payment</h2>
              <button className="tq-close-btn" onClick={closePayModal}>
                ✕
              </button>
            </div>

            <p className="tq-qr-caption">
              {payModal.guest_name} · Room {payModal.room_number}
              <br />
              Balance due: ₹
              {Number(payModal.balance_due).toLocaleString("en-IN")}
            </p>

            <div className="rb-pay-form">
              <label>Amount</label>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />

              <label>Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div className="tq-modal-actions">
              <button
                type="button"
                className="tq-secondary-btn"
                onClick={closePayModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="tq-primary-btn"
                onClick={submitPayment}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROOM BILL / INVOICE MODAL */}
      {billModal && (
        <div className="tq-overlay" onClick={closeBillModal}>
          <div
            className="tq-modal rb-bill-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tq-modal-head">
              <h2>Room Bill</h2>
              <button className="tq-close-btn" onClick={closeBillModal}>
                ✕
              </button>
            </div>

            <div className="rb-bill-summary">
              <p>
                <strong>{billModal.guest_name}</strong> · Room{" "}
                {billModal.room_number} ({billModal.room_type})
              </p>
              <p className="tq-qr-caption">
                {billModal.check_in_date}
                {billModal.check_in_time ? ` · ${billModal.check_in_time}` : ""}
                {" → "}
                {billModal.check_out_date}
                {billModal.check_out_time
                  ? ` · ${billModal.check_out_time}`
                  : ""}
                {" · "}
                {billModal.nights} night(s) · ₹
                {Number(billModal.price_per_day || 0).toLocaleString("en-IN")}
                /night
              </p>

              <div className="rb-bill-totals">
                <span>Total Amount</span>
                <strong>
                  ₹{Number(billModal.total_amount || 0).toLocaleString("en-IN")}
                </strong>

                <span>Amount Paid</span>
                <strong>
                  ₹{Number(billModal.amount_paid || 0).toLocaleString("en-IN")}
                </strong>

                <span>Balance Due</span>
                <strong>
                  ₹
                  {Number(billModal.balance_due || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {Number(billModal.balance_due || 0) > 0 ? (
              <div className="rb-pay-form">
                <label>Amount to Collect Now</label>
                <input
                  type="number"
                  min="1"
                  max={Number(billModal.balance_due || 0)}
                  placeholder="Enter amount"
                  value={billAmount}
                  onChange={(e) => {
                    setBillAmount(e.target.value);
                    setBillConfirmed(false);
                  }}
                />

                <label>Payment Method</label>
                <select
                  value={billMethod}
                  onChange={(e) => {
                    setBillMethod(e.target.value);
                    setBillConfirmed(false);
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Online">Online</option>
                </select>

                {billMethod === "Cash" && (
                  <div className="payment-info">
                    <p>💵 Collect cash from the guest at the front desk.</p>
                  </div>
                )}

                {billMethod === "Card" && (
                  <div className="payment-info">
                    <p>💳 Swipe or tap the guest's card on the POS terminal.</p>
                  </div>
                )}

                {billMethod === "Online" && (
                  <div className="payment-info">
                    <p>🌐 Guest can pay via your online payment gateway link.</p>
                  </div>
                )}

                                {(billMethod === "UPI" || billMethod === "Online") &&
                  Number(billAmount) > 0 && (
                    <div className="payment-qr-card">
                      <div className="payment-qr-image-wrap">
                        <img
                          src={getBillUpiQrUrl()}
                          alt="Scan to pay"
                          className="payment-qr-image"
                        />
                      </div>

                      <div className="payment-qr-details">
                        <span className="payment-qr-badge">Scan & Pay</span>
                        <h3>Scan & Pay</h3>
                        <p>
                          Google Pay • PhonePe • Paytm • BHIM • Any UPI App
                        </p>

                        <div className="payment-qr-amount">
                          <span>Amount</span>
                          <strong>₹{Number(billAmount).toFixed(2)}</strong>
                        </div>

                        <div className="payment-qr-upi-id">
                          UPI ID: <strong>{MERCHANT_UPI_ID}</strong>
                        </div>

                        <div className="payment-status-box">
                          <h4>Payment Status</h4>
                          {billConfirmed ? (
                            <span className="payment-success">
                              ✅ Payment Received
                            </span>
                          ) : (
                            <span className="payment-pending">
                              ⏳ Waiting for guest payment...
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="confirm-payment-btn"
                          disabled={billConfirmed}
                          onClick={() => {
                            setBillConfirmed(true);
                            alert("Payment Confirmed Successfully");
                          }}
                        >
                          {billConfirmed
                            ? "✅ Payment Confirmed"
                            : "✅ Confirm Payment"}
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="billing-success-box">
                This booking is fully paid. You can print the invoice below.
              </div>
            )}

            <div className="tq-modal-actions">
              <button
                type="button"
                className="tq-secondary-btn"
                onClick={closeBillModal}
              >
                Close
              </button>

              {Number(billModal.balance_due || 0) > 0 && (
                <button
                  type="button"
                  className="tq-primary-btn"
                  onClick={submitBillPayment}
                  disabled={
                    billSubmitting ||
                    ((billMethod === "UPI" || billMethod === "Online") &&
                      Number(billAmount) > 0 &&
                      !billConfirmed)
                  }
                >
                  {billSubmitting ? "Saving..." : "Record Payment"}
                </button>
              )}

              <button
                type="button"
                className="tq-primary-btn"
                onClick={printRoomInvoice}
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </RestaurantLayout>
  );
}

export default RoomBookingPage;