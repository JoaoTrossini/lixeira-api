const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ==========================================
// CRIAR TABELA
// ==========================================

async function criarTabela() {

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

        console.log("Tabela leituras pronta!");

    } catch (erro) {

        console.log("Erro ao criar tabela:");
        console.log(erro.message);

    }
}

// ==========================================
// CONECTAR AO POSTGRESQL
// ==========================================

pool.connect()
    .then(() => {

        console.log("PostgreSQL conectado com sucesso!");

        criarTabela();

    })
    .catch((erro) => {

        console.log("Erro ao conectar PostgreSQL:");
        console.log(erro.message);

    });

// ==========================================
// ROTA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {

    res.send("API da Lixeira Inteligente funcionando!");

});

// ==========================================
// SALVAR LEITURA
// ==========================================

app.post("/api/leituras", async (req, res) => {

    try {

        const {
            nivel,
            distanciaInterna,
            distanciaExterna,
            tampa,
            coletaSolicitada
        } = req.body;

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

        res.status(201).json({
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

// ==========================================
// BUSCAR LEITURAS
// ==========================================

app.get("/api/leituras", async (req, res) => {

    try {

        const resultado = await pool.query(`
            SELECT *
            FROM leituras
            ORDER BY id DESC
        `);

        res.json(resultado.rows);

    } catch (erro) {

        console.log("Erro ao buscar leituras:");
        console.log(erro.message);

        res.status(500).json({
            erro: "Erro ao buscar leituras"
        });

    }

});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {

    console.log(`API rodando na porta ${PORT}`);

    // ==========================================
    // LIMPAR HISTÓRICO
    // ==========================================

    app.delete("/api/leituras", async (req, res) => {

        try {

            await pool.query("TRUNCATE TABLE leituras RESTART IDENTITY");

            res.json({
                mensagem: "Histórico apagado com sucesso!"
            });

        } catch (erro) {

            console.log("Erro ao limpar histórico:");
            console.log(erro.message);

            res.status(500).json({
                erro: "Erro ao limpar histórico"
            });

        }

    });

});