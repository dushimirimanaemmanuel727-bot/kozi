import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./user-service";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.phone || !credentials?.password) {
            console.log('Auth: Missing credentials');
            return null;
          }

          console.log('Auth: Looking for user with phone:', credentials.phone);

          const user = await verifyPassword(credentials.phone, credentials.password);

          console.log('Auth: User found:', !!user);
          
          if (!user) {
            console.log('Auth: User not found or invalid password');
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
        } catch (error) {
          console.error('Auth: Error during authorization:', error);
          return null;
        }
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
