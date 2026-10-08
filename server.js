const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function iniciarBanco() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leituras (
                id SERIAL PRIMARY KEY,
                nivel INTEGER NOT NULL,
                distancia_interna REAL NOT NULL,
                distancia_externa REAL NOT NULL,
                tampa VARCHAR(20) NOT NULL,
                coleta_solicitada BOOLEAN NOT NULL,
                data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("PostgreSQL conectado com sucesso!");
        console.log("Tabela leituras pronta!");

    } catch (erro) {
        console.log("Erro ao conectar ao PostgreSQL:");
        console.log(erro.message);
    }
}

app.get("/", (req, res) => {
    res.send("API da Lixeira Inteligente funcionando!");
});

app.post("/api/leituras", async (req, res) => {

    const {
        nivel,
        distanciaInterna,
        distanciaExterna,
        tampa,
        coletaSolicitada
    } = req.body;

    try {

        const resultado = await pool.query(
            `
            INSERT INTO leituras
            (
                nivel,
                distancia_interna,
                distancia_externa,
                tampa,
                coleta_solicitada
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [
                nivel,
                distanciaInterna,
                distanciaExterna,
                tampa,
                coletaSolicitada
            ]
        );

        console.log("Leitura salva no banco!");

        res.json({
            mensagem: "Leitura salva com sucesso!",
            id: resultado.rows[0].id
        });

    } catch (erro) {

        console.log("Erro ao salvar leitura:");
        console.log(erro.message);

        res.status(500).json({
            erro: "Erro ao salvar leitura"
        });
    }
});

iniciarBanco();

app.listen(3000, () => {
    console.log("API rodando na porta 3000");
});