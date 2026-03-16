"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        setProduct(data.product);
        console.log("product state updated:", data.product);
      } catch (err) {
        console.error(err);
      }
    }

    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-pink-200 mt-10 rounded-xl shadow-lg flex flex-col md:flex-row gap-8">
      <div className="shrink-0">
        {product.images?.nodes?.length > 0 ? (
          <img
            src={product.images.nodes[0].url}
            alt={product.images.nodes[0].altText || product.title}
            className="w-full md:w-96 h-auto object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="w-full md:w-96 h-64 bg-gray-200 flex items-center justify-center rounded-lg">
            No Image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-start">
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {product.title}
        </h1>

        {/* Description */}
        <div
          className="mb-4 text-gray-700"
          dangerouslySetInnerHTML={{
            __html:
              product.descriptionHtml +
              "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores earum distinctio ullam nesciunt voluptatibus aperiam eligendi cupiditate, modi sequi in?",
          }}
        />

        {/* Status and Tags */}
        <p className="px-2 py-1 text-sm font-medium bg-green-200 text-green-800 rounded mb-2">
          {product.status}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {product.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm bg-indigo-100 text-indigo-800 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Variants */}
        {product.variants?.nodes?.length > 0 && (
          <div className="mt-0">
            <ul className="space-y-2">
              {product.variants.nodes.map((v) => (
                <li
                  key={v.id}
                  className="bg-gray-50 px-4 py-2 rounded shadow-sm"
                >
                  <span className="text-gray-800 font-semibold">
                    ${v.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="bg-blue-300 text-black font-bold py-2 px-4 rounded mt-2">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
