import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Star,
  Calendar,
  Activity,
  ArrowLeft,
} from "lucide-react";

const nav = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/hotels", label: "Hotels", icon: Building2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/activity", label: "Activity", icon: Activity },
];

/** Admin chrome — sidebar + outlet (no main Header/Footer) */
const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Admin
          </p>
          <p className="font-medium text-slate-900">Hotel Booking</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
