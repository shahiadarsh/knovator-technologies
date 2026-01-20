import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export interface FeedJob {
    title: string[];
    link: string[];
    description: string[];
    pubDate: string[];
    'job_categories'?: string[];
    'job_types'?: string[];
    'company_name'?: string[];
    'location'?: string[];
}

export class FeedService {
    static async fetchAndParse(url: string): Promise<any[]> {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/xml, text/xml, */*'
                },
                responseType: 'text', // Ensure we get the raw string
                timeout: 15000,
            });

            if (!response.data) return [];

            // Convert to string safely
            let xmlSource = typeof response.data === 'string' ? response.data : response.data.toString();
            let cleanXml = xmlSource.trim();

            // Fix unescaped ampersands (common in jobs feeds)
            cleanXml = cleanXml.replace(/&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g, '&amp;');

            const result = await parseStringPromise(cleanXml, {
                explicitArray: true,
                ignoreAttrs: false,
                mergeAttrs: true,
                trim: true,
                tagNameProcessors: [(name: string) => name.replace(/^.*:/, '')] // Strip namespaces
            });

            // Deep collector for items/entries
            const allItems: any[] = [];
            const collectItems = (obj: any) => {
                if (!obj || typeof obj !== 'object') return;

                if (Array.isArray(obj)) {
                    obj.forEach(collectItems);
                    return;
                }

                // Standard RSS/Atom item keys
                if (obj.item && Array.isArray(obj.item)) allItems.push(...obj.item);
                if (obj.entry && Array.isArray(obj.entry)) allItems.push(...obj.entry);

                // Recurse into all keys except for internal xml2js keys
                Object.keys(obj).forEach(key => {
                    if (key !== 'item' && key !== 'entry' && key !== '$' && key !== '_') {
                        collectItems(obj[key]);
                    }
                });
            };

            collectItems(result);
            console.log(`📡 Feed processed: ${url} (Found ${allItems.length} items)`);
            return allItems;
        } catch (error: any) {
            console.error(`❌ Error parsing ${url}:`, error.message);
            return [];
        }
    }
}
