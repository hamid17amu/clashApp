import express, {Application, Request, Response}  from 'express';
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import Routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));


app.use(Routes);

app.get('/', async(req: Request, res: Response):Promise<any>=> {
    const html = await ejs.renderFile(path.join(__dirname, './views/emails/welcome.ejs'), {name: "aisha"});
    // await sendMail("vadeg81392@nongnue.com", "Welcome to our platform", html);
    await emailQueue.add(emailQueueName, {to: "aishajawed11@gmail.com", subject: "Welcome to our platform", html: html });
    return res.json({message: "Email sent"});
});

//Queue
import './jobs/index.js';
import { emailQueue, emailQueueName } from './jobs/emailJobs.js';

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
