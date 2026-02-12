import { ZodError } from "zod";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";
import { supportMimes } from "./config/filesystem.js";
import { UploadedFile } from "express-fileupload";
import uuid4 from "uuid4";
import fs from "fs";

export const formatError = (error: ZodError) => {
  let errors: any = {};

  error.errors?.map((issue) => {
    errors[issue.path?.[0]] = issue.message;
  });

  return errors;
};

export const renderEmailEjs = async (filename: string, payload: any) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = await ejs.renderFile(
    path.join(__dirname, `./views/emails/${filename}.ejs`),
    payload
  );

  return html;
};

export const checkHoursDiff = (date: Date | string) => {
  const now = moment();
  const TokenSendAt = moment(date);
  const diff = moment.duration(now.diff(TokenSendAt));

  return diff.asHours;
};

export const imageValidator = (size: number, mime: string): string | null => {
  if (bytesToMB(size) > 5) {
    return "Image size must be less than 5MB,";
  } else if (!supportMimes.includes(mime)) {
    return "Image must of type png,jpg,jpeg,gif,webp.";
  }
  return null;
};

export const bytesToMB = (bytes: number): number => {
  return bytes / (1024 * 1024);
};

export const uploadFile = (image: UploadedFile) => {
  const imgExt = image?.name.split(".");
  const imgName = uuid4() + "." + imgExt[1];
  const uploadPath = process.cwd() + "/public/images/" + imgName;
  image.mv(uploadPath, (err) => {
    if (err) throw err;
  });

  return imgName;
};

export const removeImage = (imageName: string) => {
  const path = process.cwd() + "/public/images/" + imageName;

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};
