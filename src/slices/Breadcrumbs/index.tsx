import type { SliceComponentProps } from "@prismicio/react";
import { getAllBreadcrumbData } from "@/lib/siteContent";
import BreadcrumbsClient from "./BreadcrumbsClient";

export type BreadcrumbsProps = SliceComponentProps<any>;

export default async function Breadcrumbs({}: BreadcrumbsProps) {
  const siteData = await getAllBreadcrumbData();

  return <BreadcrumbsClient siteData={siteData} />;
}
