"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { signingOut } from "services/authentication";
//import SearchBar from "./SearchBar";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home"; // 🏠 Home icon
import ListAltIcon from "@mui/icons-material/ListAlt"; // 📋 Adverts icon
import PersonIcon from "@mui/icons-material/Person"; // 👤 Profile icon
import GroupIcon from "@mui/icons-material/Groups"; // 🏡 Landlords icon
import LogoutIcon from "@mui/icons-material/Logout"; // 🚪 Logout icon
import MessageIcon from "@mui/icons-material/Message"

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); // Get authentication state
  const isAuthPage = pathname === "/" || pathname === "/registerUser"; // Hide elements on login/register page

  const handleLogout = async () => {
    await signingOut();
    router.push("/"); // Redirect to home after logout
  };

  return (
    <header className="bg-dark-teal text-black p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">Futleie</h1>
      
      {/* {!isAuthPage && <SearchBar />} Show SearchBar only when logged in */}

      {!isAuthPage && (
        <nav className="flex space-x-4 items-center">
          {/* 🏠 Home Link */}
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => router.push("/")}
          >
            Home
          </Button>

          {/* 📋 Adverts Link */}
          <Button
            color="inherit"
            startIcon={<ListAltIcon />}
            onClick={() => router.push("/adverts")}
          >
            Adverts
          </Button>

          {/* 👤 Profile Link */}
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            onClick={() => router.push("/user")}
            sx={{ ml: 2}}
          >
            Profile
          </Button>

          {/* 🏡 Landlords Link */}
          <Button
            color="inherit"
            startIcon={<GroupIcon />}
            onClick={() => router.push("/allusers")}
          >
            Users
          </Button>

          {/* 📋 Messages Link */}
          <Button
            color="inherit"
            startIcon={<MessageIcon />}
            onClick={() => router.push("/messages")}
          >
            Messages
          </Button>

          {/* 🚪 Logout Button - Only visible when user is logged in */}
          {user && (
            <Button
              variant="contained"
              sx={{ ml: 2, bgcolor: "#004d40", "&:hover": { bgcolor: "#00332e" } }}
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Log Out
            </Button>
          )}
        </nav>
      )}
    </header>
  );
}
