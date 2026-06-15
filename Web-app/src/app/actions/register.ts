"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

type RegisterState =
  | { errors?: { name?: string[]; email?: string[]; password?: string[] }; message?: string }
  | undefined

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string

  const errors: { name?: string[]; email?: string[]; password?: string[] } = {}

  if (!name || name.length < 2) {
    errors.name = ["Name must be at least 2 characters."]
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Please enter a valid email address."]
  }
  if (!password || password.length < 8) {
    errors.password = ["Password must be at least 8 characters."]
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { errors: { email: ["An account with this email already exists."] } }
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { name, email, password: hashed } })

  return { message: "ok" }
}
