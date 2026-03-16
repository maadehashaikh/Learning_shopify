"use client";

import { useState } from "react";

const Page = () => {
  // Capitalized 'Page'
  const [formData, setFormData] = useState({
    title: "",
    descriptionHtml: "",
    status: "ACTIVE",
    price: "",
    tags: "",
    options: [{ name: "", values: "" }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tagsArray = formData.tags
      ? formData.tags.split(",").map((tag) => tag.trim())
      : [];

    const optionsFormatted = formData.options.map((opt) => ({
      name: opt.name.charAt(0).toUpperCase() + opt.name.slice(1), // Size / Color
      values: opt.values
        .split(",") // split comma separated string
        .map((v) => ({
          name: v.trim().charAt(0).toUpperCase() + v.trim().slice(1), // capitalize
        })),
    }));

    const productInput = {
      title: formData.title,
      bodyHtml: formData.descriptionHtml,
      status: formData.status,
      tags: tagsArray,
      variants: [
        {
          price: formData.price,
        },
      ],
    };

    console.log("Sending to API:", productInput, "and", optionsFormatted);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productInput }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Product created successfully!");
        // Form clear logic
        setFormData({
          title: "",
          descriptionHtml: "",
          status: "",
          tags: "",
          price: "",
        });
      } else {
        // Shopify errors handle karein
        const errorMsg = result.errors
          ? result.errors[0].message
          : "Something went wrong";
        alert("Ghalti hui: " + errorMsg);
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("Network error ya server ka masla hai.");
    }
  }; // handleSumbit ends here properly

  return (
    <div className="max-w-2xl mx-auto p-6 border border-blue-400 shadow-md rounded-lg mt-4">
      <h2 className="text-2xl font-bold mb-6">Create New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Product Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            required
            className="w-full p-2 border rounded mt-1 bg-transparent"
            onChange={handleChange}
          />
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="descriptionHtml"
            value={formData.descriptionHtml}
            rows="3"
            className="w-full p-2 border rounded mt-1 bg-transparent"
            onChange={handleChange}
          ></textarea>
        </div>
        {/* Tag */}
        <div>
          <label className="block text-sm font-medium">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            placeholder="e.g. Summer, Cotton"
            className="w-full p-2 border rounded mt-1 bg-transparent"
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status} // Added value
              className="w-full p-2 border rounded mt-1 bg-gray-800"
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Price </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              className="w-full p-2 border rounded mt-1 bg-transparent"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Option Name</label>
            <input
              type="text"
              name="optionName"
              placeholder="Size / Color"
              value={formData.options[0].name}
              className="w-full p-2 border rounded mt-1 bg-transparent"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options: [{ ...formData.options[0], name: e.target.value }],
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Option Values</label>
            <input
              type="text"
              name="optionValues"
              placeholder="Small, Medium, Large"
              value={formData.options[0].values}
              className="w-full p-2 border rounded mt-1 bg-transparent"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  options: [{ ...formData.options[0], values: e.target.value }],
                })
              }
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Create Product
        </button>
      </form>
    </div>
  );
};

export default Page;
