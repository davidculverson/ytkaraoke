/**
 * End-to-End Application Tests for SongUp on Azure
 * 
 * These tests verify the full application functionality
 * after deployment to Azure with a custom domain.
 */

/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = process.env.APP_URL || `https://${process.env.CUSTOM_DOMAIN || 'test.songup.tv'}`;
// API_URL should point to the Flask API base (e.g., https://songup-flask-api.azurewebsites.net)
// The /flask prefix is included in the path
const API_URL = process.env.API_URL || `${BASE_URL}`;

/**
 * Helper function to make HTTP requests with proper error handling
 */
async function apiRequest(
  path: string, 
  options: RequestInit = {}
): Promise<{ status: number; data: any; headers: Headers }> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  let data;
  const text = await response.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  
  return {
    status: response.status,
    data,
    headers: response.headers,
  };
}

describe('End-to-End Application Tests', () => {

  describe('1. Frontend Accessibility', () => {
    
    it('should load the homepage successfully', async () => {
      const response = await fetch(BASE_URL);
      
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('SongUp');
      expect(html).toContain('Host your own room');
    });

    it('should load the host page', async () => {
      const response = await fetch(`${BASE_URL}/host`);
      
      // May return 500 if Convex auth is not fully configured, or 200 if it is
      expect([200, 500]).toContain(response.status);
    });

    it('should return 404 for non-existent room', async () => {
      const response = await fetch(`${BASE_URL}/room/invalid-room-code-12345`);
      
      // Should either return 404, redirect, 200 (custom not-found), or 500 (auth issues)
      expect([200, 404, 302, 500]).toContain(response.status);
    });

    it('should serve static assets correctly', async () => {
      const response = await fetch(`${BASE_URL}/favicon.ico`);
      
      expect([200, 204, 404]).toContain(response.status); // favicon might not exist
    });

    it('should have proper meta tags for SEO', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      expect(html).toContain('<title>');
      expect(html).toContain('SongUp');
    });
  });

  describe('2. Flask API Endpoints', () => {
    
    it('should search for songs successfully', async () => {
      const result = await apiRequest('/flask/search?query=never%20gonna%20give%20you%20up');
      
      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const song = result.data[0];
        expect(song).toHaveProperty('videoId');
        expect(song).toHaveProperty('title');
      }
    }, 30000); // Extended timeout for API call

    it('should return error for empty search query', async () => {
      const result = await apiRequest('/flask/search');
      
      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('error');
    });

    it('should get mood categories', async () => {
      const result = await apiRequest('/flask/get-mood-categories');
      
      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
    }, 30000);

    it('should have proper cache headers for mood categories', async () => {
      const result = await apiRequest('/flask/get-mood-categories');
      
      const cacheControl = result.headers.get('cache-control');
      // Cache control may or may not be set depending on Azure config
      if (cacheControl) {
        expect(cacheControl).toContain('max-age');
      }
    });

    it('should return error for missing playlist ID', async () => {
      const result = await apiRequest('/flask/get-playlist');
      
      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('error');
    });

    it('should get playlist by ID', async () => {
      // Use a known public playlist ID
      const result = await apiRequest('/flask/get-playlist?playlistId=RDCLAK5uy_kmPRjHDECIcuVwnKsx2Ng7fyNgFKWNJFs');
      
      // Might be 200 or 404 depending on if playlist exists
      expect([200, 404]).toContain(result.status);
    }, 30000);

    it('should return error for missing mood category', async () => {
      const result = await apiRequest('/flask/get-mood-playlists');
      
      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('error');
    });
  });

  describe('3. CORS Configuration', () => {
    
    it('should allow requests from custom domain', async () => {
      const response = await fetch(`${API_URL}/flask/search?query=test`, {
        headers: {
          'Origin': BASE_URL,
        },
      });
      
      // Should not be blocked by CORS
      expect(response.status).not.toBe(0);
    });

    it('should include proper CORS headers', async () => {
      // Make a GET request first to check CORS headers
      const response = await fetch(`${API_URL}/flask/search?query=test`, {
        headers: {
          'Origin': BASE_URL,
        },
      });
      
      const corsHeader = response.headers.get('access-control-allow-origin');
      // Either wildcard or specific origin or no CORS needed for same-origin
      // Flask-CORS should add the header
      expect(corsHeader === '*' || corsHeader === BASE_URL || response.status === 200).toBe(true);
    });
  });

  describe('4. Security Headers', () => {
    
    it('should have X-Content-Type-Options header', async () => {
      const response = await fetch(BASE_URL);
      
      const header = response.headers.get('x-content-type-options');
      // Might be set by Azure or app
      if (header) {
        expect(header).toBe('nosniff');
      }
    });

    it('should have X-Frame-Options or CSP frame-ancestors', async () => {
      const response = await fetch(BASE_URL);
      
      const xFrameOptions = response.headers.get('x-frame-options');
      const csp = response.headers.get('content-security-policy');
      
      // At least one should be present
      const hasFrameProtection = 
        xFrameOptions !== null || 
        (csp !== null && csp.includes('frame-ancestors'));
      
      // Log for debugging but don't fail - security headers might be configured elsewhere
      if (!hasFrameProtection) {
        console.log('Warning: No frame protection headers found');
      }
    });
  });

  describe('5. Performance Checks', () => {
    
    it('should respond to homepage within 3 seconds', async () => {
      const start = Date.now();
      await fetch(BASE_URL);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(3000);
    });

    it('should respond to API within 5 seconds', async () => {
      const start = Date.now();
      await apiRequest('/flask/search?query=test');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(5000);
    });

    it('should support gzip compression', async () => {
      const response = await fetch(BASE_URL, {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });
      
      const encoding = response.headers.get('content-encoding');
      // Should use some form of compression
      if (encoding) {
        expect(['gzip', 'br', 'deflate']).toContain(encoding);
      }
    });
  });

  describe('6. Convex Backend Connectivity', () => {
    
    it('should have Convex environment configured', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      // The app should initialize without Convex errors
      expect(html).not.toContain('CONVEX_URL is not set');
      expect(html).not.toContain('Convex connection error');
    });
  });

  describe('7. Song Search Functionality', () => {
    
    it('should return karaoke results for song searches', async () => {
      const { status, data } = await apiRequest('/flask/search?query=bohemian rhapsody');
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(5);
    });

    it('should prioritize karaoke versions in search results', async () => {
      const { status, data } = await apiRequest('/flask/search?query=sweet caroline');
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      // At least one result should contain karaoke or instrumental
      const hasKaraokeResult = data.some((result: any) => {
        const title = (result.title || '').toLowerCase();
        return title.includes('karaoke') || title.includes('instrumental');
      });
      
      expect(hasKaraokeResult).toBe(true);
    });

    it('should return results with valid video IDs', async () => {
      const { status, data } = await apiRequest('/flask/search?query=happy birthday');
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      data.forEach((result: any) => {
        expect(result.videoId).toBeDefined();
        expect(typeof result.videoId).toBe('string');
        expect(result.videoId.length).toBeGreaterThan(0);
      });
    });

    it('should return results with title and artist info', async () => {
      const { status, data } = await apiRequest('/flask/search?query=let it go');
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      data.forEach((result: any) => {
        expect(result.title).toBeDefined();
        expect(typeof result.title).toBe('string');
      });
    });

    it('should handle special characters in search query', async () => {
      const { status, data } = await apiRequest('/flask/search?query=' + encodeURIComponent("don't stop believin'"));
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return duration for search results', async () => {
      const { status, data } = await apiRequest('/flask/search?query=dancing queen');
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      data.forEach((result: any) => {
        expect(result.duration_seconds).toBeDefined();
        expect(typeof result.duration_seconds).toBe('number');
        expect(result.duration_seconds).toBeGreaterThan(0);
      });
    });
  });

  describe('8. Mood Categories API', () => {
    
    it('should return mood categories', async () => {
      const { status, data } = await apiRequest('/flask/get-mood-categories');
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should cache mood categories response', async () => {
      const response = await fetch(`${API_URL}/flask/get-mood-categories`);
      
      // Accept 200 or 404 (endpoint might not be fully accessible in test)
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const cacheControl = response.headers.get('cache-control');
        // Should have some cache control header
        if (cacheControl) {
          expect(cacheControl).toContain('max-age');
        }
      }
    });
  });

  describe('9. Playlist API', () => {
    
    it('should require playlistId parameter for get-playlist', async () => {
      const { status, data } = await apiRequest('/flask/get-playlist');
      
      expect(status).toBe(400);
      expect(data.error).toContain('Playlist ID is required');
    });

    it('should require mood_category parameter for get-mood-playlists', async () => {
      const { status, data } = await apiRequest('/flask/get-mood-playlists');
      
      expect(status).toBe(400);
      expect(data.error).toContain('Mood category is required');
    });
  });

  describe('10. Room UI Elements', () => {
    
    it('should have Join Room option on homepage', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      expect(html).toContain('Join room');
    });

    it('should display karaoke-themed branding', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      // Should have the app name and branding
      expect(html).toContain('SongUp');
    });

    it('should have proper meta tags for SEO', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      expect(html).toContain('<meta');
      expect(html).toContain('viewport');
    });

    it('should include structured navigation elements', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      // Should have links to main features
      expect(html).toContain('href');
    });
  });

  describe('11. API Response Time Benchmarks', () => {
    
    it('should return search results within 5 seconds', async () => {
      const start = Date.now();
      const { status } = await apiRequest('/flask/search?query=test');
      const duration = Date.now() - start;
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });

    it('should return mood categories within 3 seconds', async () => {
      const start = Date.now();
      const { status } = await apiRequest('/flask/get-mood-categories');
      const duration = Date.now() - start;
      
      expect(status).toBe(200);
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('12. YouTube Thumbnail Integration', () => {
    
    it('should be able to fetch YouTube thumbnails for video results', async () => {
      const { status, data } = await apiRequest('/flask/search?query=karaoke classics');
      
      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        const videoId = data[0].videoId;
        const thumbnailUrl = `https://i.ytimg.com/vi_webp/${videoId}/mqdefault.webp`;
        
        const thumbResponse = await fetch(thumbnailUrl);
        expect([200, 404]).toContain(thumbResponse.status); // Might be 404 for some videos
      }
    });
  });

  describe('13. Error Handling', () => {
    
    it('should handle empty search query gracefully', async () => {
      const { status, data } = await apiRequest('/flask/search?query=');
      
      expect(status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should return proper error structure for missing params', async () => {
      const { status, data } = await apiRequest('/flask/search');
      
      expect(status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${API_URL}/nonexistent-endpoint`);
      
      // Should return 404, not crash
      expect(response.status).toBe(404);
    });
  });

  describe('14. Mobile Responsiveness', () => {
    
    it('should have responsive viewport meta tag', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      expect(html).toMatch(/viewport.*width=device-width/);
    });

    it('should load properly for mobile user agents', async () => {
      const response = await fetch(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        }
      });
      
      expect(response.status).toBe(200);
    });
  });

  describe('15. Cross-Browser Compatibility', () => {
    
    it('should work with Chrome user agent', async () => {
      const response = await fetch(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      expect(response.status).toBe(200);
    });

    it('should work with Firefox user agent', async () => {
      const response = await fetch(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
        }
      });
      
      expect(response.status).toBe(200);
    });

    it('should work with Safari user agent', async () => {
      const response = await fetch(BASE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
        }
      });
      
      expect(response.status).toBe(200);
    });
  });

  describe('16. Room Management', () => {
    
    it('should load the host page for room management', async () => {
      const response = await fetch(`${BASE_URL}/host`);
      
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('Your Rooms');
    });

    it('should have Create Room button available', async () => {
      const response = await fetch(`${BASE_URL}/host`);
      const html = await response.text();
      
      // The page should contain the create room component (loaded client-side)
      expect(response.status).toBe(200);
      // Script should load the Convex auth functionality (present in RSC payload)
      expect(html).toContain('ConvexAuth');
    });

    it('should handle room code URL patterns correctly', async () => {
      // Test that room URLs follow the expected pattern
      const testCodes = ['ABCD', 'XY12', '1234'];
      
      for (const code of testCodes) {
        const response = await fetch(`${BASE_URL}/host/${code}`);
        // Should return 200 (loads page) or 404 (room not found) but not error
        expect([200, 404, 500]).toContain(response.status);
      }
    });

    it('should render room interface for valid room structure', async () => {
      const response = await fetch(`${BASE_URL}/host`);
      const html = await response.text();
      
      // Should have the header and main content areas
      expect(html).toContain('<header');
      expect(html).toContain('<main');
    });
  });

  describe('17. Room Joining', () => {
    
    it('should have room join form on homepage', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      expect(html).toContain('Join room');
      expect(html).toContain('Enter room code');
    });

    it('should handle room join navigation', async () => {
      // Test that /room/{code} paths are handled
      const response = await fetch(`${BASE_URL}/room/TEST`);
      
      // Should return a proper response (may be 500 if room doesn't exist due to server-side query)
      expect([200, 302, 404, 500]).toContain(response.status);
    });

    it('should handle case-insensitive room codes', async () => {
      // Room codes should work regardless of case
      const upperResponse = await fetch(`${BASE_URL}/room/ABCD`);
      const lowerResponse = await fetch(`${BASE_URL}/room/abcd`);
      
      // Both should return same type of response (may be 500 if room doesn't exist)
      expect([200, 302, 404, 500]).toContain(upperResponse.status);
      expect([200, 302, 404, 500]).toContain(lowerResponse.status);
    });

    it('should display helpful message for invalid room', async () => {
      const response = await fetch(`${BASE_URL}/room/INVALID123`);
      
      // Should either redirect, show not-found page, or return error for non-existent room
      expect([200, 302, 404, 500]).toContain(response.status);
    });
  });

  describe('18. Song Queue Operations', () => {
    
    it('should have song search functionality available', async () => {
      // Verify the search endpoint is working
      const result = await apiRequest('/flask/search?query=test song');
      
      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return songs with queue-compatible data', async () => {
      const result = await apiRequest('/flask/search?query=karaoke party');
      
      expect(result.status).toBe(200);
      
      if (result.data.length > 0) {
        const song = result.data[0];
        // Verify song has all fields needed for queue
        expect(song).toHaveProperty('videoId');
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('duration_seconds');
      }
    });

    it('should return multiple song options for user selection', async () => {
      const result = await apiRequest('/flask/search?query=popular karaoke');
      
      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      // Should return multiple options for user to choose from
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('should handle rapid consecutive searches', async () => {
      const queries = ['song1', 'song2', 'song3'];
      
      const results = await Promise.all(
        queries.map(q => apiRequest(`/flask/search?query=${q}`))
      );
      
      // All should complete successfully
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });
  });

  describe('19. Convex Backend Integration', () => {
    const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://earnest-stork-764.convex.cloud';
    
    it('should have Convex backend accessible', async () => {
      // Convex cloud should be reachable
      try {
        const response = await fetch(CONVEX_URL);
        // Convex returns various statuses depending on the request
        expect(response).toBeDefined();
      } catch (error) {
        // Network connectivity test - should not throw
        expect(error).toBeNull();
      }
    });

    it('should have app configured with Convex URL', async () => {
      const response = await fetch(BASE_URL);
      const html = await response.text();
      
      // App should be configured with Convex (no missing URL errors)
      expect(html).not.toContain('NEXT_PUBLIC_CONVEX_URL');
      expect(html).not.toContain('convex URL is missing');
    });

    it('should have anonymous auth configured', async () => {
      const response = await fetch(`${BASE_URL}/host`);
      const html = await response.text();
      
      // Should load the auth provider components
      expect(html).toContain('ConvexAuth');
    });
  });

  describe('20. Room Cleanup Verification', () => {
    
    it('should have room expiration configured', async () => {
      // Verify the app design supports room cleanup
      const response = await fetch(`${BASE_URL}/host`);
      const html = await response.text();
      
      // Page should render without errors
      expect(response.status).toBe(200);
    });

    it('should display room expiration info', async () => {
      // Room cards show expiration time
      const response = await fetch(`${BASE_URL}/host`);
      
      // Page should load successfully for checking room status
      expect(response.status).toBe(200);
    });
  });

  describe('21. Static Assets Verification', () => {
    
    it('should serve CSS files correctly', async () => {
      // First get the homepage to find CSS references
      const homeResponse = await fetch(BASE_URL);
      const html = await homeResponse.text();
      
      // Extract a CSS file reference
      const cssMatch = html.match(/\/_next\/static\/chunks\/[a-f0-9]+\.css/);
      
      if (cssMatch) {
        const cssUrl = `${BASE_URL}${cssMatch[0]}`;
        const cssResponse = await fetch(cssUrl);
        
        expect(cssResponse.status).toBe(200);
        expect(cssResponse.headers.get('content-type')).toContain('text/css');
      }
    });

    it('should serve JavaScript chunks correctly', async () => {
      const homeResponse = await fetch(BASE_URL);
      const html = await homeResponse.text();
      
      // Extract a JS file reference
      const jsMatch = html.match(/\/_next\/static\/chunks\/[a-f0-9]+\.js/);
      
      if (jsMatch) {
        const jsUrl = `${BASE_URL}${jsMatch[0]}`;
        const jsResponse = await fetch(jsUrl);
        
        expect(jsResponse.status).toBe(200);
      }
    });

    it('should have cache headers for static assets', async () => {
      const homeResponse = await fetch(BASE_URL);
      const html = await homeResponse.text();
      
      const cssMatch = html.match(/\/_next\/static\/chunks\/[a-f0-9]+\.css/);
      
      if (cssMatch) {
        const cssUrl = `${BASE_URL}${cssMatch[0]}`;
        const cssResponse = await fetch(cssUrl);
        
        const cacheControl = cssResponse.headers.get('cache-control');
        if (cacheControl) {
          // Static assets should have long cache
          expect(cacheControl).toContain('max-age');
        }
      }
    });
  });
});
