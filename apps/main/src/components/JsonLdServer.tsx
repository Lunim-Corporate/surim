import type { WithContext } from "schema-dts";

interface JsonLdServerProps<T extends WithContext<any>> {
  data: T;
}

export function JsonLdServer<T extends WithContext<any>>({
  data,
}: JsonLdServerProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
