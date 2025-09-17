const mysql = require("mysql2/promise");

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: "45.194.3.128", // or sqlXXX.milesweb.com
      user: "root",
      password: "Naarace$5",
      database: "gpndb",
      port: 3306
    });
    console.log("✅ Connected to Production MilesWeb MySQL!");
    await connection.end();
  } catch (err) {
    console.error("❌ DB Connection failed:", err.message);
  }
}

testConnection();
