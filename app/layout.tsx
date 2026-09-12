import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://headsaas.com"),
  title: "HeadSaaS | Enterprise SaaS Management & Spend Optimization Platform",
  description: "Discover Shadow IT, automate employee offboarding, track renewals, optimize seat licenses, and cut software spend instantly with HeadSaaS.",
  keywords: [
    "SaaS management platform",
    "SaaS spend optimization",
    "license tracking software",
    "shadow IT discovery",
    "automated offboarding",
    "software renewals calendar",
    "SaaS cost reduction",
    "SaaS integration tracker"
  ],
  alternates: {
    canonical: "https://headsaas.com/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "HeadSaaS | Enterprise SaaS Management & Spend Optimization Platform",
    description: "Discover Shadow IT, automate employee offboarding, track renewals, optimize seat licenses, and cut software spend instantly with HeadSaaS.",
    url: "https://headsaas.com/",
    type: "website",
    siteName: "HeadSaaS",
    locale: "en_US",
    images: [
      {
        url: "https://headsaas.com/logo.png",
        width: 1200,
        height: 630,
        alt: "HeadSaaS - Best-in-class SaaS Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HeadSaaS | Enterprise SaaS Management & Spend Optimization Platform",
    description: "Discover Shadow IT, automate employee offboarding, track renewals, optimize seat licenses, and cut software spend instantly with HeadSaaS.",
    images: ["https://headsaas.com/logo.png"],
    creator: "@headsaas",
  },
};

// Rich Structured Data for Best-In-Class SEO Snippets
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HeadSaaS",
  "url": "https://headsaas.com",
  "logo": "https://headsaas.com/logo.png",
  "description": "HeadSaaS is an enterprise-grade SaaS Management Platform (SMP) and spend optimization tool that helps organizations discover Shadow IT and automate renewals.",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "HeadSaaS",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD",
    "category": "Free Plan Available",
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "124",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is HeadSaaS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeadSaaS is a SaaS management platform that helps organizations discover applications, optimize licenses, manage renewals, and control software spending.",
      },
    },
    {
      "@type": "Question",
      "name": "Does HeadSaaS support integrations like Salesforce and SAP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. HeadSaaS integrates with Salesforce, SAP, Google Workspace, Microsoft 365, Slack, Jira, Okta, and ServiceNow to align SaaS governance with procurement and financial processes.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I discover Shadow IT?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. HeadSaaS helps automatically identify unauthorized, unmanaged, or duplicate SaaS applications across your organization to eliminate shadow IT risk.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I track software renewals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. HeadSaaS provides centralized renewal tracking, dynamic calendar views, and real-time email/alert notifications to prevent missed subscription deadlines.",
      },
    },
    {
      "@type": "Question",
      "name": "Is there a free plan available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, HeadSaaS offers a generous Free tier supporting 1 seat, 50 members, 50 vendors, and 25 applications, perfect for getting full visibility into software costs.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Inject Structured Data directly into Head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FFFBEF]">
        {children}
      </body>
    </html>
  );
}
