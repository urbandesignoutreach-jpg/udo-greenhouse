// ═══════════════════════════════════════════════════════════
// api/create-checkout-session.js
// Vercel Serverless Function — Stripe Checkout Session
// ═══════════════════════════════════════════════════════════
//
// SETUP INSTRUCTIONS:
// 1. Run: npm install stripe  (in your project root)
// 2. In Vercel dashboard → Settings → Environment Variables, add:
//      STRIPE_SECRET_KEY   = sk_live_xxxxxxxxxxxx   (your Stripe secret key)
// 3. Deploy — this file goes in the /api folder of your repo.
//
// For testing before going live, use your test key:
//      STRIPE_SECRET_KEY   = sk_test_xxxxxxxxxxxx
// And use Stripe test card: 4242 4242 4242 4242, any future date, any CVC
//
// In your Stripe Dashboard:
//   - Create a product called "IP Kids Discovery Report"
//   - Set price to $4.99 one-time
//   - Copy the Price ID (price_xxxxx) — you don't need it here
//     because we're using dynamic pricing, but you can also
//     use a Price ID instead of the dynamic price object below.
// ═══════════════════════════════════════════════════════════

const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers — update origin to your deployed domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const {
      success_url,
      cancel_url,
    } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'IP Kids Discovery Report',
              description: 'Personalized AI-powered superpower discovery for your child — ages 5–17. Includes roadmap, inspirations, and downloadable PDF.',
              images: [
                // Optional: add a product image URL from your site
                // 'https://urbandesignoutreach.com/ip-kids-product.png'
              ],
            },
            unit_amount: 499, // $4.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${req.headers.origin}/?payment=success`,
      cancel_url: cancel_url || `${req.headers.origin}/`,

      // Optional: collect customer email for your records
      // customer_email can be pre-filled if you collect it on the page
      // customer_creation: 'always', // saves customer in Stripe for future reference

      // Optional metadata — useful for tracking in Stripe dashboard
      metadata: {
        product: 'ip-kids-discovery-report',
        source: 'urbandesignoutreach.com',
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
