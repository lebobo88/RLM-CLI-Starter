import * as fs from 'fs';
import * as path from 'path';

export function getFilingUrl(xmlPath: string): string | null {
  const content = fs.readFileSync(xmlPath, 'utf-8');
  // Simple regex to find the filing href in SEC XML output
  // Example: <filingHREF>https://www.sec.gov/Archives/edgar/data/320193/000032019323000106/0000320193-23-000106-index.htm</filingHREF>
  const match = content.match(/<filingHREF>(.*?)<\/filingHREF>/);
  if (!match) return null;
  
  // The filingHREF is the index page. We need the actual XBRL document or the directory.
  // Replacing index.htm with -index.xml or looking into the directory.
  const indexUrl = match[1];
  return indexUrl;
}
