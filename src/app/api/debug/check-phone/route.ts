import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return Response.json({ 
        success: false, 
        error: "Phone number is required" 
      });
    }

    console.log('Checking phone:', phone);

    // Try exact match first
    const exactResult = await query('SELECT phone, name FROM "User" WHERE phone = $1', [phone]);
    
    // Try with different formats
    const phoneVariations = [
      phone,
      phone.replace(/^250/, ''), // Remove 250 prefix
      phone.replace(/^0/, '250'), // Replace 0 with 250
      phone.replace(/^0/, ''), // Remove leading 0
      '250' + phone.replace(/^0/, ''), // Add 250 prefix
    ];

    console.log('Phone variations to check:', phoneVariations);

    const results = [];
    for (const variation of phoneVariations) {
      const result = await query('SELECT phone, name, role FROM "User" WHERE phone = $1', [variation]);
      if (result.rows.length > 0) {
        results.push({
          phone: variation,
          found: true,
          user: result.rows[0]
        });
      }
    }

    return Response.json({ 
      success: true,
      originalPhone: phone,
      exactMatch: exactResult.rows.length > 0,
      exactMatchUser: exactResult.rows[0] || null,
      variations: phoneVariations,
      matches: results
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error checking phone:', error);
    return Response.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
