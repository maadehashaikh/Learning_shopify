import axios from "axios";

export async function shopifyFetch(query, variables = {}) {
  const endpoint = `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2026-01/graphql.json`;

  try {
    const response = await axios.post(
      endpoint,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        // timeout: 30000, // 30s, default se zyada
      },
    );

    return response.data;
  } catch (error) {
    console.error("Shopify API Error:", error.response?.data || error.message);
    throw error;
  }
}
