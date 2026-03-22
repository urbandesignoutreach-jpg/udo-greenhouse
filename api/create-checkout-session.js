module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { success_url, cancel_url } = req.body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': 'IP Kids Discovery Report',
        'line_items[0][price_data][product_data][description]': 'Personalized AI-powered superpower discovery for your child — ages 5-17.',
        'line_items[0][price_data][unit_amount]': '499',
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': success_url || `${req.headers.origin}/?payment=success`,
        'cancel_url': cancel_url || `${req.headers.origin}/`,
        'metadata[product]': 'ip-kids-discovery-report',
      }).toString()
    });

    const session = await response.json();

    if (session.url) {
      return res.status(200).json({ url: session.url });
    } else {
      console.error('Stripe error:', session);
      return res.status(500).json({ error: session.error?.message || 'Stripe session creation failed' });
    }

  } catch (err) {
    console.error('Function error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
