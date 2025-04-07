import { IoHome } from "react-icons/io5";
import { FaHotel } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FaBookOpen } from "react-icons/fa6";
import { MdContactPhone } from "react-icons/md";
import React from "react";
import { Link } from "react-router-dom";
import "./Nav.css";

function Nav() {
  return (
    <nav className="nav">
      <ul>
        <li className="list active">
          <Link to="/Home" className="Link">
            <button className="icon">
              <IoHome />
            </button>
            <button className="text">HOME</button>
          </Link>
        </li>

        <li className="list active">
          <Link to="/Store" className="Link">
            <button className="icon">
              <FaHotel />
            </button>
            <button className="text">Store</button>
          </Link>
        </li>

        <li className="list active">
          <Link to="/Profile" className="Link">
            <button className="icon">
              <CgProfile />
            </button>
            <button className="text">Profile</button>
          </Link>
        </li>

        <li className="list active">
          <Link to="/About" className="Link">
            <button className="icon">
              <FaBookOpen />
            </button>
            <button className="text">About</button>
          </Link>
        </li>

        <li className="list active">
          <Link to="/Contact" className="Link">
            <button className="icon">
              <MdContactPhone />
            </button>
            <button className="text">Contact</button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
