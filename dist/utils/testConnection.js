"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testConnection() {
    try {
        const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
        if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
            throw new Error('Database connection environment variables are not all set.');
        }
        const connection = await promise_1.default.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            ssl: {
                rejectUnauthorized: true
            },
            connectTimeout: 60000
        });
        console.log('Attempting to connect to database...');
        await connection.connect();
        console.log('Database connection successful!');
        const [result] = await connection.query('SELECT 1 + 1 as test');
        console.log('Test query result:', result);
        await connection.end();
    }
    catch (error) {
        console.error('Database connection failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState
            });
        }
    }
}
testConnection();
//# sourceMappingURL=testConnection.js.map