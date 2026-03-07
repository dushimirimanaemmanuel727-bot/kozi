import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          console.log('Auth: Missing credentials');
          return null;
        }

        console.log('Auth: Looking for user with phone:', credentials.phone);

        const user = await prisma.user.findUnique({
          where: {
            phone: credentials.phone
          }
        });

        console.log('Auth: User found:', !!user);
        
        if (!user) {
          console.log('Auth: User not found');
          return null;
        }

        if (!user.passwordHash) {
          console.log('Auth: No password hash for user');
          return null;
        }

        console.log('Auth: Comparing password...');
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        console.log('Auth: Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('Auth: Invalid password');
          return null;
        }

        console.log('Auth: Login successful for:', user.name);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/"
  }
};
