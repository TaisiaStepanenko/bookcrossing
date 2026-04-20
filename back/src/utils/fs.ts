import fs from "fs";
import path from "path";

export const deletePhotoFromDish = (fileUrl: string) => {

    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;

    const filePath = path.join(__dirname, '../../', fileUrl);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}