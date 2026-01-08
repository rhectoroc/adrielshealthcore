import sql from "@/app/api/utils/sql";
import { hash, verify } from 'argon2';
import { auth } from '@/auth';

export async function POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return Response.json(
                { error: 'Current and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return Response.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // 1. Get user and their credentials account
        // We need to join with auth_accounts to find the password hash
        const userResult = await sql`
        SELECT u.id, a.password, a."providerAccountId"
        FROM auth_users u
        JOIN auth_accounts a ON u.id = a."userId"
        WHERE u.email = ${session.user.email} AND a.provider = 'credentials'
        LIMIT 1
      `;

        if (userResult.length === 0) {
            return Response.json({ error: 'User account not found or not using credentials.' }, { status: 404 });
        }

        const user = userResult[0];
        const currentHash = user.password;

        // 2. Verify current password
        const isValid = await verify(currentHash, currentPassword);
        if (!isValid) {
            return Response.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // 3. Hash new password
        const newHash = await hash(newPassword);

        // 4. Update password in auth_accounts
        await sql`
        UPDATE auth_accounts
        SET password = ${newHash}
        WHERE "userId" = ${user.id} AND provider = 'credentials'
      `;

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error changing password:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
