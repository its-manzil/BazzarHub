import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";
import Logo from "./Logo";
import CartLogo from "./CartLogo";
import "./cart.css";




function Cart({ cartItems, onRemoveFromCart }) {
  const navigate = useNavigate();

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const emptyCart = cartItems.length === 0;

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Nav),
    React.createElement(Logo),
    React.createElement(CartLogo),

    React.createElement(
      "h1",
      { className: "cart-heading" },
      "Your BazaarHub Cart"
    ),

    React.createElement(
      "section",
      { className: "split-cart" },

      // Left Section
      React.createElement(
        "div",
        { className: "cart-info" },
        React.createElement("h2", null, "🛍️ Items in your Cart"),
        React.createElement(
          "p",
          null,
          "Here you can review the items you’ve added. Ready to check out or keep shopping? We've got you!"
        ),
        React.createElement(
          "div",
          { className: "cart-map-info" },
          React.createElement("p", null, "Want to visit us in person?"),
          React.createElement(
            "a",
            {
              href: "https://maps.google.com/?q=Kathmandu,Nepal",
              target: "_blank",
              rel: "noreferrer",
            },
            "📍 BazaarHub Location"
          )
        )
      ),

      // Right Section
      React.createElement(
        "div",
        { className: "cart-list-wrapper" },

        emptyCart
          ? React.createElement(
              "p",
              { className: "cart-empty" },
              "🛒 Your cart is currently empty.",
              React.createElement("br"),
              React.createElement(
                Link,
                { to: "/", className: "cart-shop-btn" },
                "Continue Shopping"
              )
            )
          : [
              ...cartItems.map((item) =>
                React.createElement(
                  "div",
                  { key: item.id, className: "cart-item" },
                  React.createElement(
                    "div",
                    { className: "cart-item-details" },
                    React.createElement("h3", null, item.name),
                    React.createElement("p", null, `Quantity: ${item.quantity}`),
                    React.createElement("p", null, `Price: $${item.price}`)
                  ),
                  React.createElement(
                    "button",
                    {
                      className: "remove-btn",
                      onClick: () => onRemoveFromCart(item.id),
                    },
                    "Remove"
                  )
                )
              ),
              React.createElement(
                "div",
                { className: "cart-footer" },
                React.createElement("p", { className: "total-price" }, `Total: $${getTotalPrice().toFixed(2)}`),
                React.createElement(
                  "div",
                  { className: "cart-action-buttons" },
                  React.createElement(
                    "button",
                    {
                      className: "checkout-btn",
                      onClick: () => navigate("/checkout"),
                    },
                    "Proceed to Checkout"
                  ),
                  React.createElement(
                    Link,
                    { to: "/", className: "continue-btn" },
                    "Continue Shopping"
                  )
                )
              )
            ]
      )
    )
  );
}

export default Cart;
