import React from "react";
import Navbar from "../Navbar";
import "./products.css";

function Products() {
  const productList = [
    {
      id: "P001",
      name: "Wireless Earbuds",
      category: "Electronics",
      price: "₹1,499",
      stock: 50,
      status: "Active",
    },
    {
      id: "P002",
      name: "Cotton T-shirt",
      category: "Clothing",
      price: "₹799",
      stock: 0,
      status: "Out of Stock",
    },
    {
      id: "P003",
      name: "Bluetooth Speaker",
      category: "Electronics",
      price: "₹2,999",
      stock: 25,
      status: "Active",
    },
  ];

  return (
    <div className="products-dashboard">
      <Navbar />
      <div className="products-content">
        <h1 className="products-title">All Products</h1>
        <table className="products-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span
                    className={`status-badge ${
                      product.status === "Active" ? "active" : "out"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
