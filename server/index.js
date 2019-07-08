const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');
const keys = require('./keys');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pgClient = new Pool({
  user: keys.pgUser,
  password: keys.pgPassword,
  database: keys.pgDatabase,
  host: keys.pgHost,
  port: parseInt(keys.pgPort),
});

pgClient.on('error', console.error);

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: parseInt(keys.redisPort),
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');

  res.send(values.rows);
});

app.get('/values/current', async (req, res, next) => {
  redisClient.hgetall('values', (err, values) => {
    if (err) {
      next(err);
    } else {
      res.send(values);
    }
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .then(() => {
    app.listen(5000, err => {
      if (err) {
        console.error(err);
        process.exit(0);
      }

      console.log('Server listening');
    });
  })
  .catch(console.error);
