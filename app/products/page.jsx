"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <>
      <div className="w-full max-w-5xl mx-auto z-20 max-md:px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold m-5 text-white">All Products</h1>
          <Link href="/products/create">
            <button className="border-2 border-blue-400 p-3 rounded-2xl text-sm">
              Create Product
            </button>
          </Link>
        </div>
        <div className="pt-14 py-4 px-4 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {products.map((p) => {
              return (
                <div
                  key={p.id}
                  className="flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-white shadow-xl hover:border-indigo-500 transition-all duration-300 group"
                >
                  <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg bg-zinc-800">
                    {p.images?.nodes[0]?.url ? (
                      <img
                        src={p.images.nodes[0].url}
                        alt={p.images.nodes[0].altText || p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-500 text-xs italic">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold group-hover:text-indigo-400 transition-colors">
                    {p.title}
                  </h3>

                  <div className="mt-2 text-2xl font-bold text-indigo-300">
                    ${p.variants?.nodes[0]?.price || "0.00"}
                  </div>

                  <div className="mt-2">
                    <span
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold ${
                        p.status === "ACTIVE"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div
                    className="mt-4 mb-6 text-sm text-gray-400 line-clamp-2 h-10"
                    dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
                  />
                  <div className="mt-auto">
                    <Link
                      href={`/products/${encodeURIComponent(p.id)}`}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 block text-center"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
