"use server";

import dbConnect from "./mongodb";
import { SiteContentModel, type SiteContentDoc } from "./models/site-content";

export type AboutContent = SiteContentDoc["about"];
export type ContactContent = SiteContentDoc["contact"];

export async function getSiteContent(): Promise<
  Partial<Pick<SiteContentDoc, "about" | "contact">>
> {
  await dbConnect();
  const doc = (await SiteContentModel.findOne(
    {}
  ).lean()) as unknown as SiteContentDoc | null;
  if (!doc) {
    return {};
  }
  return {
    about: doc.about,
    contact: doc.contact,
  };
}

export async function upsertAboutContent(
  content: NonNullable<AboutContent>
): Promise<NonNullable<AboutContent>> {
  await dbConnect();
  const updated = (await SiteContentModel.findOneAndUpdate(
    {},
    { $set: { about: content, updatedAt: new Date() } },
    { upsert: true, new: true }
  ).lean()) as unknown as SiteContentDoc;
  return updated.about!;
}

export async function upsertContactContent(
  content: NonNullable<ContactContent>
): Promise<NonNullable<ContactContent>> {
  await dbConnect();
  const updated = (await SiteContentModel.findOneAndUpdate(
    {},
    { $set: { contact: content, updatedAt: new Date() } },
    { upsert: true, new: true }
  ).lean()) as unknown as SiteContentDoc;
  return updated.contact!;
}

export async function upsertAboutMe(content: string): Promise<string> {
  await dbConnect();
  const existing = (await SiteContentModel.findOne(
    {}
  ).lean()) as unknown as SiteContentDoc | null;

  if (!existing || !existing.about) {
    const created = (await SiteContentModel.findOneAndUpdate(
      {},
      {
        $set: {
          about: { title: "About Me", description: content, skills: [] },
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).lean()) as unknown as SiteContentDoc;
    return created.about!.description;
  }

  const updated = (await SiteContentModel.findOneAndUpdate(
    {},
    { $set: { "about.description": content, updatedAt: new Date() } },
    { new: true }
  ).lean()) as unknown as SiteContentDoc;
  return updated.about!.description;
}
