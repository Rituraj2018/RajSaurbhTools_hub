async function testHistory() {
  const API_URL = 'http://localhost:5000/api';
  console.log('Testing Processing History API...');

  try {
    let token = '';

    // 1. Try login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vikram.test@example.com',
        password: 'Password123!',
      }),
    });

    const loginData = await loginRes.json();
    if (loginData.success) {
      token = loginData.data.token;
      console.log('✅ Logged in as vikram.test@example.com');
    } else {
      console.error('Login error:', loginData);
      return;
    }

    // 2. Create sample history entries
    const sampleEntries = [
      {
        tool: 'passport-photo-studio',
        toolName: 'Passport Photo Studio Pro',
        inputFiles: [{ name: 'portrait_photo_raw.jpg', size: 1420000, type: 'image/jpeg' }],
        outputFile: { name: 'Passport_Photos_A4_8Copies.pdf', size: 840000, type: 'application/pdf' },
        status: 'completed',
        metadata: { copies: 8, paperSize: 'A4', background: 'Light Blue', ratio: '35x45mm' },
      },
      {
        tool: 'image-to-pdf',
        toolName: 'Image to PDF Converter',
        inputFiles: [
          { name: 'document_scan_page1.png', size: 980000, type: 'image/png' },
          { name: 'document_scan_page2.png', size: 1040000, type: 'image/png' },
        ],
        outputFile: { name: 'Compiled_Document_2Pages.pdf', size: 1820000, type: 'application/pdf' },
        status: 'completed',
        metadata: { pageSize: 'A4', orientation: 'Portrait', marginMm: 10, totalImages: 2 },
      },
      {
        tool: 'aadhaar-print-studio',
        toolName: 'Aadhaar Print Studio Pro',
        inputFiles: [{ name: 'eAadhaar_Password_Protected.pdf', size: 2150000, type: 'application/pdf' }],
        outputFile: { name: 'Aadhaar_PVC_Print_Sheet_A4.pdf', size: 920000, type: 'application/pdf' },
        status: 'completed',
        metadata: { layout: 'Side-by-Side (Foldable)', cardDimensions: '85.6x54mm', cuttingGuides: true },
      },
      {
        tool: 'pdf-merge',
        toolName: 'PDF Merge Tool Pro',
        inputFiles: [
          { name: 'Financial_Report_Q1.pdf', size: 1450000 },
          { name: 'Financial_Report_Q2.pdf', size: 1620000 },
        ],
        outputFile: { name: 'Financial_Report_H1_Combined.pdf', size: 3010000 },
        status: 'completed',
        metadata: { totalFiles: 2, outputPages: 14 },
      },
      {
        tool: 'ayushman-print-tool',
        toolName: 'Ayushman Card Print Tool Pro',
        inputFiles: [{ name: 'PMJAY_Family_Cards_Batch.pdf', size: 3200000 }],
        outputFile: { name: 'Ayushman_Card_A4_Print_Sheet.pdf', size: 1100000 },
        status: 'completed',
        metadata: { totalCards: 3, layout: 'Side-by-Side', contrastAdjustment: '+15%' },
      },
    ];

    for (const entry of sampleEntries) {
      const res = await fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entry),
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to post entry:', data);
      }
    }
    console.log('✅ Created 5 sample history entries');

    // 3. Fetch history
    const getRes = await fetch(`${API_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getData = await getRes.json();

    console.log('Fetch Status:', getRes.status);
    console.log('Fetch Response Data:', JSON.stringify(getData, null, 2));

    console.log('🎉 Processing History API Test Passed Successfully!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.message);
  }
}

testHistory();
