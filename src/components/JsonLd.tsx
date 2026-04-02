"use client";

import Script from "next/script";
import type { WithContext } from "schema-dts";

interface JsonLdProps<T extends WithContext<any>> {
  data: T;
  id?: string;
}

export function JsonLd<T extends WithContext<any>>({ data, id }: JsonLdProps<T>) {
  return (
    <Script
      id={id || `jsonld-${Math.random().toString(36).substr(2, 9)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      strategy="afterInteractive"
    />
  );
}