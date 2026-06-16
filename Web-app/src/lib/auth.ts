import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
<<<<<<< HEAD
  session: { strategy: "database" },
=======
  session: { strategy: "jwt" },
>>>>>>> f8c6c656c0c00efeaf809e3425359a8606b7b04e
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

<<<<<<< HEAD
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
=======
        const email = credentials.email.trim().toLowerCase()
        const password = credentials.password

        const user = await prisma.user.findUnique({
          where: { email },
>>>>>>> f8c6c656c0c00efeaf809e3425359a8606b7b04e
        })

        if (!user?.password) return null

<<<<<<< HEAD
        const valid = await bcrypt.compare(credentials.password, user.password)
=======
        const valid = await bcrypt.compare(password, user.password)
>>>>>>> f8c6c656c0c00efeaf809e3425359a8606b7b04e
        return valid ? user : null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
<<<<<<< HEAD
    session({ session, user }) {
      session.user.id = user.id
=======
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
>>>>>>> f8c6c656c0c00efeaf809e3425359a8606b7b04e
      return session
    },
  },
}
