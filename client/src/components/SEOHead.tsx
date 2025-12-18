import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "article" | "product";
  image?: string;
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  type = "website",
  image = "https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png",
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes("T-Rex Motors") ? title : `${title} | T-Rex Motors`;
  const siteUrl = "https://trexmotors.com";
  const canonicalUrl = canonical || (typeof window !== "undefined" ? window.location.href : siteUrl);

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMeta("description", description);
    updateMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", type, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:image", image, true);
    updateMeta("og:site_name", "T-Rex Motors", true);
    updateMeta("og:locale", "en_US", true);
    
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", image);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

  }, [fullTitle, description, canonicalUrl, type, image, noIndex]);

  return null;
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": "https://trexmotors.com/#organization",
    "name": "T-Rex Motors",
    "alternateName": "T-Rex Motors Richmond",
    "description": "Richmond's premier used car dealership offering quality pre-owned vehicles with competitive pricing and flexible financing options.",
    "url": "https://trexmotors.com",
    "logo": "https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png",
    "image": "https://storage.googleapis.com/msgsndr/QjiQRR74D1pxPF7I8fcC/media/68042afc29d629c59c352a2b.png",
    "telephone": "+1-804-555-0123",
    "email": "sales@trexmotors.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Auto Drive",
      "addressLocality": "Richmond",
      "addressRegion": "VA",
      "postalCode": "23220",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.5407,
      "longitude": -77.4360
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "$$",
    "currenciesAccepted": "USD",
    "paymentAccepted": "Cash, Credit Card, Financing",
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 37.5407,
        "longitude": -77.4360
      },
      "geoRadius": "50 mi"
    },
    "sameAs": [
      "https://www.facebook.com/trexmotors",
      "https://www.instagram.com/trexmotors",
      "https://www.google.com/maps/place/trexmotors"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Used Vehicle Inventory",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Used Cars"
        },
        {
          "@type": "OfferCatalog",
          "name": "Used Trucks"
        },
        {
          "@type": "OfferCatalog",
          "name": "Used SUVs"
        }
      ]
    }
  };

  useEffect(() => {
    const existingScript = document.getElementById("local-business-schema");
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement("script");
    script.id = "local-business-schema";
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("local-business-schema");
      if (el) el.remove();
    };
  }, []);

  return null;
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  useEffect(() => {
    const existingScript = document.getElementById("breadcrumb-schema");
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement("script");
    script.id = "breadcrumb-schema";
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("breadcrumb-schema");
      if (el) el.remove();
    };
  }, [items]);

  return null;
}

interface VehicleSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  vin?: string;
  condition?: string;
}

export function VehicleSchema({
  name,
  description,
  image,
  price,
  make,
  model,
  year,
  mileage,
  color,
  vin,
  condition = "used"
}: VehicleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": name,
    "description": description,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": make
    },
    "model": model,
    "vehicleModelDate": year.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": mileage,
      "unitCode": "SMI"
    },
    "color": color,
    "vehicleIdentificationNumber": vin,
    "itemCondition": condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutoDealer",
        "name": "T-Rex Motors",
        "url": "https://trexmotors.com"
      }
    }
  };

  useEffect(() => {
    const existingScript = document.getElementById("vehicle-schema");
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement("script");
    script.id = "vehicle-schema";
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("vehicle-schema");
      if (el) el.remove();
    };
  }, [name, price, make, model, year]);

  return null;
}

export function WebVitalsMonitor() {
  useEffect(() => {
    if (typeof window !== "undefined" && "sendBeacon" in navigator) {
      const reportWebVitals = async () => {
        try {
          const { getCLS, getFCP, getLCP, getTTFB } = await import("web-vitals");
          const send = (metric: any) => {
            const data = JSON.stringify({
              name: metric.name,
              value: metric.value,
              rating: metric.rating,
              delta: metric.delta,
              id: metric.id,
              url: window.location.href,
              timestamp: Date.now()
            });
            if (navigator.sendBeacon) {
              navigator.sendBeacon("/api/rum", data);
            }
          };
          getCLS(send);
          getFCP(send);
          getLCP(send);
          getTTFB(send);
        } catch (e) {
          console.debug("Web Vitals not available");
        }
      };
      reportWebVitals();
    }
  }, []);

  return null;
}
