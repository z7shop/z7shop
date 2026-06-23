import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dbGet, dbRun } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await dbGet('SELECT * FROM users WHERE email = ?', credentials.email);

        if (!user) return null;

        const isValid = bcrypt.compareSync(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', user.email);
        if (!existingUser) {
          const id = uuidv4();
          const placeholderPassword = bcrypt.hashSync(uuidv4(), 10);
          await dbRun('INSERT INTO users (id, name, email, password, phone, provider) VALUES (?, ?, ?, ?, ?, ?)',
            id, user.name || '', user.email, placeholderPassword, '', 'google');
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google') {
        const dbUser = await dbGet('SELECT id, role FROM users WHERE email = ?', token.email as string);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      } else if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
