import { Link } from "react-router-dom";
import {
  FaHome,
  FaPills,
  FaReceipt,
  FaUser,
  FaChartBar,
  FaUsersCog,
} from "react-icons/fa";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem("user")); // ✅ Get user from localStorage

  return (
    <div className="h-screen w-64 bg-blue-800 text-white p-4 fixed">
      <h2 className="text-2xl font-bold mb-8">Medihub</h2>
      <ul className="space-y-4">
        <li>
          <Link to="/" className="flex items-center gap-2 hover:text-blue-300">
            <FaHome /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/inventory" className="flex items-center gap-2 hover:text-blue-300">
            <FaPills /> Inventory
          </Link>
        </li>
        <li>
          <Link to="/billing" className="flex items-center gap-2 hover:text-blue-300">
            <FaReceipt /> Billing
          </Link>
        </li>
        <li>
          <Link to="/invoices" className="flex items-center gap-2 hover:text-blue-300">
            <FaReceipt /> Invoice History
          </Link>
        </li>
        <li>
          <Link to="/customers" className="flex items-center gap-2 hover:text-blue-300">
            <FaUser /> Customers
          </Link>
        </li>
        {/* ✅ Only Admins can see Reports */}
        {user?.role === "admin" && (
          <>
            <li>
              <Link to="/reports" className="flex items-center gap-2 hover:text-blue-300">
                <FaChartBar /> Reports
              </Link>
            </li>
            <li>
              <Link to="/manage-users" className="flex items-center gap-2 hover:text-blue-300">
                <FaUsersCog /> Manage Users
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
