"use server";

import dbConnect from "./mongodb";
import { WorkItemModel } from "./models/work-item";
import { generateSocialMediaEmbed } from "./utils";

export type WorkItem = {
  _id: string; // MongoDB auto-generated ObjectId
  title: string;
  description: string;
  type: "youtube" | "short-form" | "other" | "carousel";
  url?: string;
  thumbnailUrl?: string;
  images?: string[];
  visible?: boolean;
  createdAt: string;
};

export async function getWorkItems(): Promise<WorkItem[]> {
  try {
    await dbConnect();
    // Get all work items (no user filtering)
    const workItems = await WorkItemModel.find({}).sort({ createdAt: -1 });
    console.log("Found work items in DB:", workItems.length);
    console.log(
      "Work items data:",
      workItems.map((item) => ({
        _id: item._id,
        title: item.title,
        type: item.type,
      }))
    );

    return workItems.map((item) => ({
      _id: item._id.toString(),
      title: item.title,
      description: item.description,
      type: item.type,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      images: item.images,
      visible: item.visible,
      createdAt: item.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching work items:", error);
    return [];
  }
}

export async function saveWorkItem(
  item: Omit<WorkItem, "_id" | "createdAt">
): Promise<WorkItem> {
  try {
    await dbConnect();

    // Auto-generate embed URL if it's a social media URL and no thumbnail provided
    let thumbnailUrl = item.thumbnailUrl;
    if (!thumbnailUrl && item.url) {
      const generatedEmbed = generateSocialMediaEmbed(item.url);
      if (generatedEmbed) {
        thumbnailUrl = generatedEmbed;
        console.log("Generated social media embed:", thumbnailUrl);
      }
    }

    const newItem = new WorkItemModel({
      ...item,
      thumbnailUrl,
      createdAt: new Date().toISOString(),
    });
    console.log("Mongoose model data before save:", newItem.toObject());

    await newItem.save();
    console.log("Saved work item with _id:", newItem._id);

    return {
      _id: newItem._id.toString(),
      title: newItem.title,
      description: newItem.description,
      type: newItem.type,
      url: newItem.url,
      thumbnailUrl: newItem.thumbnailUrl,
      images: newItem.images,
      visible: newItem.visible,
      createdAt: newItem.createdAt,
    };
  } catch (error) {
    console.error("Error saving work item:", error);
    throw error;
  }
}

export async function updateWorkItem(
  id: string,
  updates: Partial<WorkItem>
): Promise<void> {
  try {
    await dbConnect();
    await WorkItemModel.findByIdAndUpdate(id, updates);
  } catch (error) {
    console.error("Error updating work item:", error);
    throw error;
  }
}

export async function deleteWorkItem(id: string): Promise<void> {
  try {
    await dbConnect();
    await WorkItemModel.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting work item:", error);
    throw error;
  }
}
