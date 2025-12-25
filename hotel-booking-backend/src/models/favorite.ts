import mongoose, { Document } from "mongoose";

export interface IFavorite extends Document {
  userId: string;
  hotelId: string;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    hotelId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, hotelId: 1 }, { unique: true });

export default mongoose.model<IFavorite>("Favorite", favoriteSchema);
