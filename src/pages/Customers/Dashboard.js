import React from "react";
import Nav from "./Nav";
import Logo from "./Logo";
import CartLogo from "./CartLogo";
import "./dashboard.css";

export default function CustomerDashboard() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", { className: "dashboard-wrapper" },
      React.createElement("header", { className: "dashboard-header" },
        React.createElement("div", { className: "dashboard-top" },
          React.createElement(Logo),
          React.createElement(Nav),
          React.createElement(CartLogo)
        ),
        React.createElement("h1", { className: "dashboard-title" }, "My Dashboard")
      ),
      React.createElement("main", { className: "dashboard-main" },
        // Summary Cards
        React.createElement("section", { className: "dashboard-summary" },
          ["Total Orders", "Pending Deliveries", "Wishlist Items", "Total Spent"].map((label, idx) =>
            React.createElement("div", { className: "summary-card", key: idx },
              React.createElement("h3", null, label),
              React.createElement("span", null,
                label === "Total Orders" ? "12" :
                label === "Pending Deliveries" ? "3" :
                label === "Wishlist Items" ? "5" : "$245.00"
              )
            )
          )
        ),
        // Recent Orders
        React.createElement("section", { className: "dashboard-section" },
          React.createElement("h2", null, "Recent Orders"),
          React.createElement("table", { className: "orders-table" },
            React.createElement("thead", null,
              React.createElement("tr", null,
                ["Order ID", "Date", "Items", "Status", "Action"].map((head, i) =>
                  React.createElement("th", { key: i }, head)
                )
              )
            ),
            React.createElement("tbody", null,
              [
                { id: "#1024", date: "2025-05-01", items: 3, status: "Shipped" },
                { id: "#1019", date: "2025-04-24", items: 2, status: "Delivered" }
              ].map((order, i) =>
                React.createElement("tr", { key: i },
                  React.createElement("td", null, order.id),
                  React.createElement("td", null, order.date),
                  React.createElement("td", null, order.items),
                  React.createElement("td", null, order.status),
                  React.createElement("td", null,
                    React.createElement("button", { className: "view-btn" }, "View")
                  )
                )
              )
            )
          )
        ),
        // Account Info
        React.createElement("section", { className: "dashboard-section" },
          React.createElement("h2", null, "Account Information"),
          React.createElement("div", { className: "account-info" },
            React.createElement("p", null, React.createElement("strong", null, "Name: "), "John Doe"),
            React.createElement("p", null, React.createElement("strong", null, "Email: "), "john@example.com"),
            React.createElement("p", null, React.createElement("strong", null, "Phone: "), "+1234567890"),
            React.createElement("button", { className: "edit-btn" }, "Edit Profile")
          )
        ),
        // Addresses
        React.createElement("section", { className: "dashboard-section" },
          React.createElement("h2", null, "Saved Addresses"),
          React.createElement("ul", { className: "address-list" },
            ["123 Main Street, City, Country", "456 Elm Road, Other City, Country"].map((addr, idx) =>
              React.createElement("li", { key: idx },
                addr,
                React.createElement("button", { className: "edit-btn" }, "Edit")
              )
            )
          )
        ),
        // Support
        React.createElement("section", { className: "dashboard-section" },
          React.createElement("h2", null, "Support"),
          React.createElement("p", null,
            "Need help? ",
            React.createElement("a", { href: "https://www.fb.com", target: "_blank", rel: "noopener noreferrer" }, "Contact support"),
            " or visit our ",
            React.createElement("a", { href: "https://www.fb.com", target: "_blank", rel: "noopener noreferrer" }, "FAQ"),
            "."
          )
        )
      )
    )
  );
}
