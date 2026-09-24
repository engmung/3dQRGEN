
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function SEO({ 
  title = "3D QR Designer - Create Custom 3D Printable QR Codes",
  description = "Design and create custom 3D printable QR codes with text and images. Perfect for business cards, signage, gifts, and creative projects.",
  keywords,
  image = "https://3d-qrgen.vercel.app/images/og-image.webp",
  url
}: SEOProps) {
  const siteUrl = "https://3d-qrgen.vercel.app";
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  return (
    <>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "3D QR Designer",
          "applicationCategory": "DesignApplication",
          "operatingSystem": "Web Browser",
          "url": "https://3d-qrgen.vercel.app",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Custom 3D QR code generation",
            "Text and image overlay",
            "OBJ file export for 3D printing",
            "Multiple size options",
            "Color customization",
            "Client-side processing (Privacy focused)"
          ],
          "browserRequirements": "Requires WebGL support",
          "screenshot": "https://3d-qrgen.vercel.app/images/og-image.webp",
          "creator": {
            "@type": "Organization",
            "name": "3D QR Designer"
          }
        })}
      </script>
    </>
  );
}

