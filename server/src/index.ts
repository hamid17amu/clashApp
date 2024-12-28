import express, {Application, request, response}  from 'express';
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { sendMail } from './config/mail.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));


app.get('/', async(req, res) => {
    const html = await ejs.renderFile(path.join(__dirname, './views/emails/welcome.ejs'), {name: "John Doe"});
    // await sendMail("vadeg81392@nongnue.com", "Welcome to our platform", html);
    await emailQueue.add("sendMail", {to: "vadeg81392@nongnue.com", subject: "Welcome to our platform", html: html });
    return res.json({message: "Email sent"});
});

//Queue
import './jobs/index.js';
import { emailQueue } from './jobs/emailJobs.js';

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
