// import React from "react";
// import qrImage from "../assets/order-qr.png";
// import "./ScanToOrder.css";

// function ScanToOrder() {
//   return (
//     <div className="scan-order-wrapper">
//       <div className="scan-order-card">
//         <div className="scan-order-logo">SD</div>
//         <h1 className="scan-order-title">SmartDine Pro</h1>
//         <p className="scan-order-tagline">Scan. Select. Savor.</p>

//         <img
//           src={qrImage}
//           alt="Scan to order"
//           className="scan-order-qr"
//         />

//         <h2 className="scan-order-heading">Scan to Order</h2>
//         <p className="scan-order-hint">
//           Open your phone camera, scan the code above, enter your table
//           number, and start ordering — pay and track your food, all from
//           your phone.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default ScanToOrder;
import React from "react";
import { Link } from "react-router-dom";
import qrImage from "../assets/order-qr.png";
import "./ScanToOrder.css";

function ScanToOrder() {
  return (
    <div className="scan-order-wrapper">
      <div className="scan-order-card">
        <Link to="/dashboard" className="scan-order-back">
          ← Back to Dashboard
        </Link>

        <div className="scan-order-logo">SD</div>
        <h1 className="scan-order-title">SmartDine Pro</h1>
        <p className="scan-order-tagline">Scan. Select. Savor.</p>

        <img
          src={qrImage}
          alt="Scan to order"
          className="scan-order-qr"
        />

        <h2 className="scan-order-heading">Scan to Order</h2>
        <p className="scan-order-hint">
          Open your phone camera, scan the code above, enter your table
          number, and start ordering — pay and track your food, all from
          your phone.
        </p>
      </div>
    </div>
  );
}

export default ScanToOrder;