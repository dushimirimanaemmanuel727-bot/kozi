const testAccounts = [
  { phone: "0799999999", name: "ishimwe adeline", role: "employer" },
  { phone: "0788888888", name: "Superadmin User", role: "superadmin" },
  { phone: "0750000001", name: "Super Admin", role: "admin" },
  { phone: "0784746467", name: "mustafa adnan", role: "worker" },
  { phone: "0795555112", name: "Dushirimana emmanuel", role: "employer" },
  { phone: "0789364844", name: "Dushirimana Emmanuel", role: "worker" },
  { phone: "250788123456", name: "Test User", role: "worker" },
  { phone: "0781234569", name: "Test Employer", role: "employer" },
  { phone: "0781234568", name: "Test Worker", role: "worker" },
  { phone: "1234567890", name: "System Administrator", role: "admin" }
];

console.log("Available accounts for testing:");
console.log("================================");
testAccounts.forEach((account, index) => {
  console.log(`${index + 1}. Name: ${account.name}`);
  console.log(`   Phone: ${account.phone}`);
  console.log(`   Role: ${account.role}`);
  console.log(`   Try common passwords: password123, admin123, test123, 123456`);
  console.log("");
});

console.log("\nKnown working credentials:");
console.log("Phone: 0750000001");
console.log("Password: SuperAdmin123!");
console.log("Role: admin");
