import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useState } from "react";
import * as apiClient from "../api-client";
import { Plus, LogOut, Building2 } from "lucide-react";

const getAvatarUrl = () => {
  const image = localStorage.getItem("user_image");
  const email = localStorage.getItem("user_email");
  const name = localStorage.getItem("user_name");
  const id = email || name || "user";
  if (image) return image;
  return `https://robohash.org/${encodeURIComponent(id)}.png?set=set1&size=80x80`;
};

const UsernameMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const email = localStorage.getItem("user_email");
  const name = localStorage.getItem("user_name");

  const avatarUrl = imgError
    ? `https://robohash.org/${email || "user"}.png?set=set1&size=80x80`
    : getAvatarUrl();

  const handleMenuClick = () => setIsOpen(false);

  const handleLogout = async () => {
    await apiClient.signOut();
    setIsOpen(false);
    window.location.href = "/";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border-2 border-teal-400/80 p-0.5 focus:outline-none focus:ring-2 focus:ring-teal-300">
          <img
            src={avatarUrl}
            alt={name || email || "User"}
            className="h-9 w-9 rounded-full object-cover"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white p-2">
        <div className="px-2 py-1">
          <p className="font-medium">{name || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
        <Separator className="my-2 bg-gray-200" />
        <DropdownMenuItem
          onClick={handleMenuClick}
          asChild
          className="py-1.5 rounded-md cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
        >
          <Link
            to="/add-hotel"
            className="flex items-center gap-2 w-full font-bold hover:text-primary-600"
          >
            <Plus className="h-4 w-4" />
            Add Hotel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleMenuClick}
          asChild
          className="py-1.5 rounded-md cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
        >
          <Link
            to="/my-hotels"
            className="flex items-center gap-2 w-full font-bold hover:text-primary-600"
          >
            <Building2 className="h-4 w-4" />
            My Hotels
          </Link>
        </DropdownMenuItem>
        <Separator className="my-2 bg-gray-200" />
        <DropdownMenuItem className="py-1.5 rounded-md cursor-pointer">
          <Button
            onClick={handleLogout}
            className="w-full font-bold bg-primary-600 hover:bg-primary-700 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UsernameMenu;
