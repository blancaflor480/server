import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error('Database connection environment variables are not all set.');
    }
    
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: {
        rejectUnauthorized: true // Try this first for testing
      },
      connectTimeout: 60000 // Increase timeout to 60 seconds
    });
    
    console.log('Attempting to connect to database...');
    await connection.connect();
    console.log('Database connection successful!');
    
    // Test a simple query
    const [result] = await connection.query('SELECT 1 + 1 as test');
    console.log('Test query result:', result);
    
    await connection.end();
  } catch (error) {
    console.error('Database connection failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        code: (error as any).code,
        errno: (error as any).errno,
        sqlState: (error as any).sqlState
      });
    }
  }
}

testConnection();