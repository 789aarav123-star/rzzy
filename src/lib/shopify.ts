const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch({ query, variables = {} }: { query: string; variables?: any }) {
  const url = `https://${domain}/api/2026-07/graphql.json`;

  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token || '',
      },
      body: JSON.stringify({ query, variables }),
    });

    return await result.json();
  } catch (error) {
    console.error('Shopify Fetch Error:', error);
    throw new Error('Failed to fetch data from Shopify');
  }
}
export async function createCheckout(variantId: string, quantity: number) {
  const query = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
      }
    }
  `;
  const variables = {
    input: {
      lineItems: [{ variantId, quantity }]
    }
  };
  const res = await shopifyFetch({ query, variables });
  return res.data?.checkoutCreate?.checkout?.webUrl;
}