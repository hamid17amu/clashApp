import express, {Application, request, response}  from 'express';
import "dotenv/config";
const app: Application = express();
const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
