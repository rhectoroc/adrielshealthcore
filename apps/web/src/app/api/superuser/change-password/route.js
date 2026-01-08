import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { hash, verify } from 'argon2';
import { auth } from '@/auth'; // Assuming we can use the auth helper, or check session manually

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
});

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            // 1. Get user and their credentials account
            // We need to join with auth_accounts to find the password hash
            const userQuery = `
        SELECT u.id, a.password, a."providerAccountId"
        FROM auth_users u
        JOIN auth_accounts a ON u.id = a."userId"
        WHERE u.email = $1 AND a.provider = 'credentials'
      `;
            const userResult = await client.query(userQuery, [session.user.email]);

            if (userResult.rowCount === 0) {
                // This might happen if they logged in via Google/etc managed by 'credentials' logic in a weird way,
                // or if the account link is missing.
                return NextResponse.json({ error: 'User account not found or not using credentials.' }, { status: 404 });
            }

            const user = userResult.rows[0];
            const currentHash = user.password;

            // 2. Verify current password
            const isValid = await verify(currentHash, currentPassword);
            if (!isValid) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            // 3. Hash new password
            const newHash = await hash(newPassword);

            // 4. Update password in auth_accounts
            // We update based on userId and provider='credentials'
            const updateQuery = `
        UPDATE auth_accounts
        SET password = $1
        WHERE "userId" = $2 AND provider = 'credentials'
      `;
            await client.query(updateQuery, [newHash, user.id]);

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
