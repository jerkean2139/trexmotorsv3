import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Dealership } from "@shared/schema";

interface DealershipContextType {
  dealership: Dealership | null;
  isLoading: boolean;
  error: Error | null;
}

const DealershipContext = createContext<DealershipContextType>({
  dealership: null,
  isLoading: true,
  error: null,
});

const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return url;
  } catch {
    return '';
  }
};

export function DealershipProvider({ children }: { children: ReactNode }) {
  const { data: dealership, isLoading, error } = useQuery<Dealership>({
    queryKey: ["/api/public/dealership-context"],
    queryFn: async () => {
      const params = new URLSearchParams();
      const pathSlug = window.location.pathname.split('/')[1];
      if (pathSlug && !['admin', 'financing', 'thank-you', 'privacy-policy', 'terms-of-service'].includes(pathSlug)) {
        params.set('slug', pathSlug);
      }
      const response = await fetch(`/api/public/dealership-context?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch dealership context');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (dealership) {
      const root = document.documentElement;
      
      const hexToHSL = (hex: string): string => {
        if (!isValidHexColor(hex)) return '93 81% 49%';
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return '93 81% 49%';
        
        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
          }
        }
        
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };

      if (dealership.primaryColor && isValidHexColor(dealership.primaryColor)) {
        root.style.setProperty('--primary', hexToHSL(dealership.primaryColor));
        root.style.setProperty('--dealership-primary', dealership.primaryColor);
      }
      if (dealership.secondaryColor && isValidHexColor(dealership.secondaryColor)) {
        root.style.setProperty('--dealership-secondary', dealership.secondaryColor);
      }
      if (dealership.accentColor && isValidHexColor(dealership.accentColor)) {
        root.style.setProperty('--dealership-accent', dealership.accentColor);
      }

      if (dealership.name) {
        document.title = `${dealership.name} - Quality Used Cars`;
      }

      const sanitizedFavicon = sanitizeUrl(dealership.favicon || '');
      if (sanitizedFavicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = sanitizedFavicon;
      }
    }
  }, [dealership]);

  return (
    <DealershipContext.Provider value={{ 
      dealership: dealership || null, 
      isLoading, 
      error: error as Error | null 
    }}>
      {children}
    </DealershipContext.Provider>
  );
}

export function useDealership() {
  const context = useContext(DealershipContext);
  if (context === undefined) {
    throw new Error('useDealership must be used within a DealershipProvider');
  }
  return context;
}
