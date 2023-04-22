const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');

const uuid = require('./helpers/uuid');


const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '/public')));

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'))
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
});

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const readFromFile = async (filePath) => {
  try {
    const data = await readFileAsync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

const writeToFile = async (filePath, content) => {
  try {
    await writeFileAsync(filePath, JSON.stringify(content, null, 4));
    console.info(`Data written to ${filePath}`);
  } catch (err) {
    console.error(err);
  }
};

const readAndAppend = async (filePath, content) => {
  try {
    const fileData = await readFromFile(filePath);
    fileData.push(content);
    await writeToFile(filePath, fileData);
  } catch (err) {
    console.error(err);
  }
};

app.get('/api/notes', async (req, res) => {
  // res.sendFile(path.join(__dirname, './db/db.json'))
  console.info(`${req.method} request received for notes`);
  const notes = await readFromFile('./db/db.json');
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  console.info(`${req.method} request received to add a new note`);

  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    await readAndAppend('./db/db.json', newNote);
    res.json(newNote);
  } else {
    res.status(400).send('Please provide a title and text for your note.');
  }
});

app.listen(process.env.PORT || PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);



module.exports = app;
