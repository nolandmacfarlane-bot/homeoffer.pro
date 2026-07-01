# Home Offer Pro

A transparent, real estate offer marketplace built with Next.js and Supabase.

## Features

- **Property Listings**: Sellers post homes with starting offer prices
- **Real-time Offers**: Buyers submit offers in $1,000 increments
- **12-Day Auction Period**: Standard offer period with automatic 15-minute extensions when offers come in within the final 15 minutes
- **Agent Approval Flow**: Listing agents approve buyers before they can submit offers
- **Live Dashboards**: 
  - Seller dashboard: Manage properties, track offers
  - Buyer dashboard: Track submitted offers
  - Property detail: Real-time offer tracking with countdown timer

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/dustin-macf/homeoffer.pro.git
cd homeoffer-pro
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### Database Setup

Create the following tables in Supabase:

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  user_type VARCHAR NOT NULL CHECK (user_type IN ('buyer', 'seller', 'agent')),
  agent_license VARCHAR,
  agent_state VARCHAR,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**properties**
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR NOT NULL,
  zip VARCHAR NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  sqft INT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  starting_offer INT NOT NULL,
  listing_agent_id UUID NOT NULL REFERENCES users(id),
  offer_period_days INT DEFAULT 12,
  offer_end_date TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'closed', 'sold')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**offers**
```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  amount INT NOT NULL,
  is_highest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**agent_approvals**
```sql
CREATE TABLE agent_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  listing_agent_id UUID NOT NULL REFERENCES users(id),
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

### For Sellers
1. Sign up as a seller
2. Post a property with photos and starting offer price
3. View incoming offers in real-time
4. Track the highest offer and time remaining

### For Buyers
1. Sign up as a buyer
2. Get approved by listing agent
3. Browse properties
4. Submit offers in $1,000 increments
5. Track your offers on the buyer dashboard

### For Agents
1. Sign up as an agent
2. Manage seller listings
3. Approve buyers for properties
4. Guide the offer process

## How the Auction Works

1. **12-Day Period**: Each property has a 12-day offer period
2. **Automatic Extensions**: If an offer comes in within the final 15 minutes, the period extends another 15 minutes
3. **$1,000 Increments**: All offers must be multiples of $1,000
4. **Highest Wins**: The highest offer wins when the period closes
5. **Bank Handling**: Financing and closing handled by buyers' banks and title companies

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
git push origin main
```

## Project Structure

```
homeoffer-pro/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── properties/        # Properties listing & detail
│   ├── seller/            # Seller dashboard
│   ├── buyer/             # Buyer dashboard
│   └── layout.tsx         # Root layout
├── lib/                    # Utility functions
│   ├── supabase.ts       # Supabase client & types
│   ├── auth.ts           # Authentication functions
│   ├── offers.ts         # Offer logic
│   └── properties.ts     # Property management
├── public/                # Static assets
└── package.json           # Dependencies
```

## Key Features Implemented

- ✅ User authentication (Supabase Auth)
- ✅ Role-based access (buyer, seller, agent)
- ✅ Property listing with images
- ✅ Real-time offer submission
- ✅ 12-day auction period with auto-extensions
- ✅ $1,000 increment validation
- ✅ Live offer tracking
- ✅ Agent approval workflow
- ✅ Responsive design (Tailwind CSS)
- ✅ Countdown timers

## Future Enhancements

- [ ] Payment processing integration
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Video tutorials embedded in platform
- [ ] Agent training dashboard
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Webhook integrations for title companies
- [ ] API for third-party integrations

## Support

For issues or questions, contact: support@homeoffer.pro

## License

Proprietary - All rights reserved
