/**
 * Cleans HTML content from Swell or other sources by removing duplicate footers and other unwanted elements
 * Note: This function uses regex and is meant to be used server-side
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return ""

  // Remove footer elements
  let cleaned = html.replace(/<footer[^>]*>.*?<\/footer>/gs, "")

  // Remove elements with footer-related classes
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*footer[^"]*"[^>]*>.*?<\/div>/gs, "")
  cleaned = cleaned.replace(/<div[^>]*id="[^"]*footer[^"]*"[^>]*>.*?<\/div>/gs, "")

  // Remove navigation elements that might be duplicating the header
  cleaned = cleaned.replace(/<nav[^>]*>.*?<\/nav>/gs, "")

  // Remove specific elements that appear to be duplicating site structure
  cleaned = cleaned.replace(/<div[^>]*class="[^"]*site-header[^"]*"[^>]*>.*?<\/div>/gs, "")
  cleaned = cleaned.replace(/<header[^>]*>.*?<\/header>/gs, "")

  return cleaned
}
