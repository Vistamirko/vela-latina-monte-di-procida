import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { resolveMetadataForPath } from "@/lib/seo";
import AccessClient from "./AccessClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string | string[] }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const rawReturnUrl = Array.isArray(sp?.returnUrl) ? sp.returnUrl[0] : sp?.returnUrl;
  const targetPath = rawReturnUrl || "/";
  const ogUrlOverride = rawReturnUrl
    ? `${SITE_URL}/access?returnUrl=${encodeURIComponent(rawReturnUrl)}`
    : `${SITE_URL}/access`;

  return resolveMetadataForPath(targetPath, {
    ogUrlOverride,
    noIndex: true,
  });
}

export default function AccessPage() {
  return <AccessClient />;
}
