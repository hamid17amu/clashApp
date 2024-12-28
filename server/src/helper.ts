import {ZodError} from 'zod';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';


export const formatError= (error:ZodError)=>{
    let errors:any={};

    error.errors?.map((issue)=>{
        errors[issue.path?.[0]]= issue.message;
    });

    return errors;
}

export const renderEmailEjs= async(filename: string, payload: any)=>{
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const html = await ejs.renderFile(path.join(__dirname, `./views/emails/${filename}.ejs`), payload);

    return html;
}