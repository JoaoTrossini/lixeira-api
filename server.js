const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());

// ==========================================
// CONEXÃO COM MYSQL
// ==========================================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Senai@118",
    database: "lixeira_inteligente"
});

// ==========================================
// TESTAR CONEXÃO
// ==========================================

db.connect((erro) => {

    if (erro) {
        console.log("Erro ao conectar ao MySQL:");
        console.log(erro.message);
        return;
    }

    console.log("MySQL conectado com sucesso!");
});

// ==========================================
// ROTA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {

    res.send("API da Lixeira Inteligente funcionando!");
});

// ==========================================
// RECEBER LEITURA DA LIXEIRA
// ==========================================

app.post("/api/leituras", (req, res) => {

    const {
        nivel,
        distanciaInterna,
        distanciaExterna,
        tampa,
        coletaSolicitada
    } = req.body;

    const sql = `
        INSERT INTO leituras
        (
            nivel,
            distancia_interna,
            distancia_externa,
            tampa,
            coleta_solicitada
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            nivel,
            distanciaInterna,
            distanciaExterna,
            tampa,
            coletaSolicitada
        ],
        (erro, resultado) => {

            if (erro) {

                console.log("Erro ao salvar leitura:");
                console.log(erro);

                return res.status(500).json({
                    erro: "Erro ao salvar leitura"
                });
            }

            console.log("Leitura salva no banco!");

            res.json({
                mensagem: "Leitura salva com sucesso!",
                id: resultado.insertId
            });
        }
    );
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(3000, () => {

    console.log("API rodando em http://localhost:3000");
});