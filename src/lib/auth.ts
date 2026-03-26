import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./user-service";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Auth: Starting authorization with credentials:', {
            phone: credentials?.phone,
            hasPassword: !!credentials?.password
          });

          if (!credentials?.phone || !credentials?.password) {
            console.log('Auth: Missing credentials');
            return null;
          }

          console.log('Auth: Looking for user with phone:', credentials.phone);

          const user = await verifyPassword(credentials.phone, credentials.password);

          console.log('Auth: User verification result:', {
            userFound: !!user,
            userId: user?.id,
            userName: user?.name,
            userRole: user?.role
          });
          
          if (!user) {
            console.log('Auth: User not found or invalid password');
            return null;
          }

          console.log('Auth: Login successful for:', user.name);
          const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          };
          console.log('Auth: Returning user object:', result);
          return result;
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
  },
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: false,
};
