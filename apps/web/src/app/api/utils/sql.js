import postgres from 'postgres';

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set'
  );
};

const sql = process.env.DATABASE_URL 
  ? postgres(process.env.DATABASE_URL, {
      ssl: process.env.DATABASE_URL.includes('sslmode=disable') ? false : 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    }) 
  : NullishQueryFunction;

export default sql;