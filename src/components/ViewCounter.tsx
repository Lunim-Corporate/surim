"use client";

import { useEffect, useState } from "react";
import { isValidUidClient } from "@/utils/validators";

interface ViewCounterProps {
  articleUid: string;
}

// Simple bot detection based on user agent patterns
// This is not foolproof but helps reduce bot traffic
// May fail to detect modern bots or crawlers that don't use obvious keywords
// May need to use a more robust bot detection service (e.g., reCAPTCHA, Cloudflare Bot Management)
function isLikelyBot(): boolean {
  if (typeof window === "undefined") return true;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const botPatterns = [
    'bot', 'crawl', 'spider', 'slurp', 'yahoo', 'google',
    'baidu', 'bing', 'msn', 'duckduckgo', 'teoma', 'ia_archiver',
    'facebookexternalhit', 'prerender', 'headless', 'phantom'
  ];
  
  return botPatterns.some(pattern => userAgent.includes(pattern));
}


export default function ViewCounter({ articleUid }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    // Validate UID format (client-side quick check)
    if (!isValidUidClient(articleUid)) {
      console.error("Invalid article UID format");
      return;
    }

    // Don't track bots
    if (isLikelyBot()) {
      return;
    }

    // Check localStorage to prevent double-counting on immediate reload
    const storageKey = `blog-view-${articleUid}`;
    const lastViewed = localStorage.getItem(storageKey);
    const now = Date.now();
    
    // If viewed in the last 60 seconds, skip increment but still fetch count
    const shouldIncrement = !lastViewed || (now - parseInt(lastViewed, 10)) > 60000;

    // Fetch current view count
    const fetchViewCount = async () => {
      try {
        const response = await fetch(`/api/views?uid=${encodeURIComponent(articleUid)}`);
        if (response.ok) {
          const data = await response.json();
          if (typeof data.view_count === 'number') {
            setViewCount(data.view_count);
          }
        } else if (response.status === 429) {
          console.warn("Rate limit exceeded");
        }
      } catch (err) {
        console.error("Error fetching view count:", err);
      }
    };

    // Increment view count if needed
    const incrementView = async () => {
      if (!shouldIncrement) {
        await fetchViewCount();
        return;
      }

      try {
        const response = await fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: articleUid }),
        });

        if (response.ok) {
          const data = await response.json();
          if (typeof data.view_count === 'number') {
            setViewCount(data.view_count);
            
            // Update localStorage with current timestamp
            localStorage.setItem(storageKey, now.toString());
          }
        } else if (response.status === 429) {
          console.warn("Rate limit exceeded for increments");
          // Still try to fetch the current count
          await fetchViewCount();
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.error("Error incrementing view:", err);
        
        // Still try to fetch the current count on error
        await fetchViewCount();
      }
    };

    incrementView();
  }, [articleUid]);

  // Don't render anything if no count yet
  if (viewCount === null) {
    return "";
  }

  return (
    <span>{viewCount.toLocaleString()}</span>
  );
}
