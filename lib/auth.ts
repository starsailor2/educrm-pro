import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const DEMO_USERS = [
  { id: "u1", name: "Admin User", email: "admin@educrm.pro", role: "ADMIN", passwordHash: "$2b$10$rsQGtbHUVwoQfjDj/Qvp6O2wP2H5kX6FOeazuyBilGmD8S9j3nIlS" }, // admin123
  { id: "u2", name: "Counselor User", email: "counselor@educrm.pro", role: "COUNSELOR", passwordHash: "$2b$10$KnZbiRm7EtnvxzYjENMxzepOb.Mkw6bjm3o7IthJowBYYyKZX14i." }, // counselor123
];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = DEMO_USERS.find((u) => u.email === credentials.email);
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
