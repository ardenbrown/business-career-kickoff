"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { parseResumeFile } from "@/lib/resume";
import { generateResumeAnalysis } from "@/lib/ai/generators";

export async function uploadResumeAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get("resume");

  if (!(file instanceof File)) {
    throw new Error("Please choose a PDF resume.");
  }

  const parsed = await parseResumeFile(file);
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    throw new Error("Complete onboarding before uploading a resume.");
  }

  await prisma.resume.updateMany({
    where: { userId: user.id, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      size: parsed.size,
      content: parsed.buffer,
      extractedText: parsed.text,
    },
  });

  await generateResumeAnalysis(profile, user.id, parsed.text, resume.id);
  revalidatePath("/resume-feedback");
  revalidatePath("/dashboard");
  revalidatePath("/account");

  return { success: true };
}
