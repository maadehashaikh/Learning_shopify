import { shopifyFetch } from "@/lib/shopify";

// saray products ko fetch karne ke liye
export async function GET() {
  const query = `
    {
      products(first: 10) {
        nodes {
          id
          title
          descriptionHtml
          status
          tags
          variants(first: 1) {
            nodes {
              price
            }
          }
            images(first: 5) {
        nodes {
          url     
          altText  
          width
          height
        }
      }
        }
      }
    }
  `;

  try {
    const result = await shopifyFetch(query);

    // 1. Check karein agar result hi nahi aaya ya structure ghalat hai
    if (!result || !result.data) {
      console.error("Shopify Error Response:", result);
      return Response.json(
        { error: "Data not found. Check your API credentials or Query." },
        { status: 500 },
      );
    }
    // 2. Agar sab theek hai to data bhejein
    return Response.json(result.data.products.nodes);
  } catch (error) {
    console.error("Fetch Error:", error);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

// 2. Naya Product banane ke liye
export async function POST(request) {
  try {
    // STEP 1: UI se data lein
    const uiData = await request.json();
    console.log("I am UI Data : ", uiData);

    // STEP 2: Shopify API ke liye variables prepare karein
    const variables = {
      input: {
        title: uiData.productInput.title,
        descriptionHtml: uiData.productInput.bodyHtml,
        status: uiData.productInput.status || "ACTIVE",
        tags: uiData.productInput.tags || [],
      },
    };
    console.log("Variables for Shopify API:", JSON.stringify(variables));

    // STEP 3: Product create mutation
    const mutation = `
      mutation productCreate($input: ProductCreateInput!) {
        productCreate(product: $input) {
          product {
            id
            title
            descriptionHtml
            tags
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const result = await shopifyFetch(mutation, variables);
    console.log("Shopify Response:", JSON.stringify(result, null, 2));

    // STEP 4: GraphQL errors check
    if (result?.errors) {
      return Response.json(
        { error: "GraphQL Error", details: result.errors },
        { status: 500 },
      );
    }

    // STEP 5: Shopify user errors check
    if (result?.data?.productCreate?.userErrors?.length > 0) {
      return Response.json(
        {
          error: "Shopify User Error",
          details: result.data.productCreate.userErrors,
        },
        { status: 400 },
      );
    }

    if (!result?.data?.productCreate?.product) {
      return Response.json(
        {
          error: "Product creation failed",
          details: result,
        },
        { status: 500 },
      );
    }

    // STEP 6: Product ID extract karen
    const productId = result.data.productCreate.product.id;
    console.log("Product ID:", productId);

    // STEP 7: Variant query
    const variantQuery = `
      query getProductVariants($id: ID!) {
        product(id: $id) {
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
    const variantResult = await shopifyFetch(variantQuery, { id: productId });
    console.log("Variant Response:", JSON.stringify(variantResult, null, 2));

    // STEP 8: Variant ID extract karen
    const variantId = variantResult.data.product.variants.nodes[0].id;
    console.log("Variant ID:", variantId);

    // STEP 9: Variant price update mutation
    const variantMutation = `
        mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants {
              id
              price
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

    const variantVariables = {
      productId: productId,
      variants: [
        {
          id: variantId,
          price: uiData.productInput.variants[0].price,
          // optionValues: [
          //   {
          //     optionName: "Title",
          //     name: uiData.productInput.variants[0].title || "small",
          //   },
          // ],
        },
      ],
    };
    console.log("Variant Mutation:", variantMutation);
    console.log(
      "Variant Variables:",
      JSON.stringify(variantVariables, null, 2),
    );

    const updateVariant = await shopifyFetch(variantMutation, variantVariables);
    console.log(
      "Variant Updated Response:",
      JSON.stringify(updateVariant, null, 2),
    );

    // STEP 10: Variant user errors check
    if (
      updateVariant?.data?.productVariantsBulkUpdate?.userErrors?.length > 0
    ) {
      return Response.json(
        {
          error: "Variant Update Error",
          details: updateVariant.data.productVariantsBulkUpdate.userErrors,
        },
        { status: 400 },
      );
    }
    // options create  kr rhy  hain

    const createOptionsMutation = `
  mutation productOptionsCreate($productId: ID!, $options: [OptionCreateInput!]!) {
    productOptionsCreate(productId: $productId, options: $options) {
      product {
        id
        title
        options {
          name
          optionValues {
            name
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

    const createOptionsVariables = {
      productId: productId,
      options: [
        {
          name: "Size",
          values: [{ name: "Small" }],
        },
        {
          name: "Color",
          values: [{ name: "Red" }],
        },
      ],
    };

    const optionsCreateVariant = await shopifyFetch(
      createOptionsMutation,
      createOptionsVariables,
    );
    console.log(
      "Variant Updated Response:",
      JSON.stringify(optionsCreateVariant, null, 2),
    );

    // STEP 11: Success response
    return Response.json({
      success: true,
      product: result.data.productCreate.product,
    });
  } catch (err) {
    console.error("API Route Error:", err);
    return Response.json(
      {
        error: "Server Internal Error",
        message: err.message,
      },
      { status: 500 },
    );
  }
}
