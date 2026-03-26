// Test script to debug profile update issues
const fetch = require('node-fetch');

async function testProfileUpdate() {
  try {
    // First, let's try to call the add-columns endpoint to ensure all columns exist
    console.log('Adding missing columns...');
    const addColumnsResponse = await fetch('http://localhost:3000/api/debug/add-columns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (addColumnsResponse.ok) {
      const addColumnsResult = await addColumnsResponse.json();
      console.log('Columns added successfully:', addColumnsResult);
    } else {
      console.error('Failed to add columns:', await addColumnsResponse.text());
    }

    // Test a simple profile update
    console.log('\nTesting profile update...');
    const formData = new FormData();
    formData.append('name', 'Test User Updated');
    formData.append('age', '25');
    formData.append('gender', 'MALE');
    formData.append('phone', '0788123456');
    formData.append('district', 'GASABO');
    formData.append('category', 'GENERAL');
    formData.append('skills', 'Test skills');
    formData.append('experienceYears', '2');
    formData.append('availability', 'FULL_TIME');
    formData.append('minMonthlyPay', '50000');
    formData.append('liveIn', 'false');
    formData.append('bio', 'Test bio');
    formData.append('nationalId', '1234567890123456');
    formData.append('passportNumber', 'PA1234567');

    const profileResponse = await fetch('http://localhost:3000/api/profile/worker/update', {
      method: 'PUT',
      body: formData,
    });

    if (profileResponse.ok) {
      const result = await profileResponse.json();
      console.log('Profile update successful:', result);
    } else {
      const error = await profileResponse.text();
      console.error('Profile update failed:', profileResponse.status, error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testProfileUpdate();
