import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CREDIT_PACKS } from '@/lib/constants';
import type { CreditTier } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Verify a completed checkout session (called on redirect back from Stripe)
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed.' }, { status: 400 });
    }

    return NextResponse.json({ tier: session.metadata?.tier });
  } catch (error) {
    console.error('Stripe verify error:', error);
    return NextResponse.json(
      { error: 'Could not verify session.' },
      { status: 500 }
    );
  }
}

// Create a new checkout session
export async function POST(req: NextRequest) {
  try {
    const { tier } = (await req.json()) as { tier: CreditTier };

    const pack = CREDIT_PACKS.find((p) => p.tier === tier);
    if (!pack) {
      return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(pack.price * 100), // cents
            product_data: {
              name: `${pack.label} — ${pack.credits} Image Credits`,
              description: `${pack.credits} AI image generation credits${pack.enhanceEnabled ? ' (includes PRO Enhance)' : ''}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { tier: String(tier) },
      success_url: `${origin}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
