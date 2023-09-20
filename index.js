const pg = require('pg');
const client = new pg.Client('postgres://localhost/digimon');
const express = require('express');
const app = express();

app.use(express.json())


app.get('/', (req, res, next) => {
    console.log('connected to page')
    res.send('Connected to the server')
});

app.get('/api/digimon', async (req, res, next) => {
    console.log('connected to /api/digimon')
    try{
        const SQL = `SELECT * FROM digimon;`

        const response = await client.query(SQL);
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

app.get('/api/digimon/:id', async (req, res, next) => {
    try {
        const SQL = 'SELECT * FROM digimon WHERE id=$1'
        const response = await client.query(SQL, [req.params.id])
        if (response.rows.length === 0) {
            throw new Error('ID does not exist')
        }
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
});

app.delete('/api/digimon/:id', async (req, res, next) => {
    console.log('req.params.id', req.params.id);
    const SQL = `DELETE FROM digimon WHERE id=$1 RETURNING *`

    const response = await client.query(SQL, [req.params.id]);
    console.log(response.rows)
    res.send('delete')
})

app.post('/api/digimon', async (req, res, next) => {
    console.log(req.body)
    try {
        const SQL = `
        INSERT INTO digimon(name, type) 
        VALUES($1, $2)
        RETURNING *
        `;

        const response = await client.query(SQL, [req.body.name, req.body.type]);
        console.log(response.rows)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

app.put('/api/digimon/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE digimon
            SET name = $1, type = $2
            WHERE id = $3
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.type, req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

app.use('*', (req, res, next) => {
    res.status(404).send('invalid Route')
});

app.use((err, req, res, next) => {
    console.log('error handler');
    res.status(500).send(err.message)
})





const start = async () => {
    await client.connect();
    console.log('connected')

    const SQL = `
        DROP TABLE IF EXISTS digimon;
        CREATE TABLE digimon(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            type VARCHAR(20)
        );
        INSERT INTO digimon(name, type) values('Agumon', 'reptile');
        INSERT INTO digimon(name, type) values('Patamon', 'celestial'); 
        INSERT INTO digimon(name, type) values('Angemon', 'angelic')
    `;
    await client.query(SQL);
    console.log('TABLES CREATED')

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`))
}

start()