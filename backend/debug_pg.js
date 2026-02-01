import parse from 'pg-connection-string';
import dotenv from 'dotenv';
dotenv.config();
const str = process.env.DATABASE_URL;
console.log('DATABASE_URL from env:', str);
try {
    const config = parse(str);
    console.log('Parsed config successfully');
    console.log('User:', config.user);
    console.log('Password:', config.password);
    console.log('Host:', config.host);
    console.log('Port:', config.port);
    console.log('Database:', config.database);
} catch (e) {
    console.log('Parsing failed:', e.message);
    if (e.input) console.log('Input:', e.input);
}
