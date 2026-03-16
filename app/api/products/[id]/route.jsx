import { shopifyFetch } from "@/lib/shopify";

export async function GET(request, context) {
  try {
    const params = await context.params;

    // encoded id receive hoga
    const encodedId = params.id;

    // decode karein
    const productId = decodeURIComponent(encodedId);

    console.log("Decoded Product ID:", productId);

    const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        descriptionHtml
        status
        tags

        images(first: 10) {
          nodes {
            url
            altText
          }
        }

        variants(first: 10) {
          nodes {
            id
            title
            price
            
          }
        }
      }
    }
    `;

    const result = await shopifyFetch(query, { id: productId });

    console.log("Single Product Response:", JSON.stringify(result, null, 2));

    // GraphQL errors
    if (result?.errors) {
      return Response.json(
        { error: "GraphQL Error", details: result.errors },
        { status: 500 },
      );
    }

    if (!result?.data?.product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      product: result.data.product,
    });
  } catch (err) {
    console.error("API Error:", err);

    return Response.json(
      {
        error: "Server Error",
        message: err.message,
      },
      { status: 500 },
    );
  }
}
