import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const date = new Date(); 
        cb(null, date.toISOString().slice(0,10).replace(/-/g, '-') + '-' + file.originalname);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png/;
    const checkName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (checkName && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только изображения (jpeg, jpg, png)!'));
    }
};

export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });