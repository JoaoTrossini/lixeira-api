const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// ==========================================
// CONEXÃO COM POSTGRESQL
// ==========================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ==========================================
// CRIAR E CONFIGURAR TABELA
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
                data_hora TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            ALTER TABLE leituras
            ALTER COLUMN data_hora
            SET DEFAULT CURRENT_TIMESTAMP
        `);

        console.log("Tabela leituras pronta!");
        console.log("Horário configurado corretamente.");
    } catch (erro) {
        console.log("Erro ao criar/configurar tabela:");
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
// PAINEL PRINCIPAL
// ==========================================

app.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id,
                nivel,
                distancia_interna,
                distancia_externa,
                tampa,
                coleta_solicitada,
                TO_CHAR(
                    data_hora AT TIME ZONE 'America/Sao_Paulo',
                    'DD/MM/YYYY, HH24:MI:SS'
                ) AS data_hora
            FROM leituras
            ORDER BY id DESC
        `);

        let linhas = "";

        resultado.rows.forEach((leitura) => {
            linhas += `
                <tr>
                    <td>${leitura.id}</td>

                    <td>
                        ${leitura.nivel}%
                    </td>

                    <td>
                        ${leitura.distancia_interna} cm
                    </td>

                    <td>
                        ${leitura.distancia_externa} cm
                    </td>

                    <td>
                        ${leitura.tampa}
                    </td>

                    <td>
                        ${
                            leitura.coleta_solicitada
                                ? "🚛 SIM"
                                : "✅ NÃO"
                        }
                    </td>

                    <td>
                        ${leitura.data_hora}
                    </td>
                </tr>
            `;
        });

        // ==================================
        // NENHUMA LEITURA
        // ==================================

        if (linhas === "") {
            linhas = `
                <tr>
                    <td colspan="7">
                        Nenhuma leitura registrada.
                    </td>
                </tr>
            `;
        }

        // ==================================
        // HTML DO PAINEL
        // ==================================

        res.send(`
<!DOCTYPE html>

<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Lixeira Inteligente
    </title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 30px;
            font-family: Arial, sans-serif;
            background: #f2f2f2;
            color: #222;
        }

        .container {
            max-width: 1200px;
            margin: auto;
        }

        .cabecalho {
            background: white;
            padding: 25px;
            border-radius: 18px;
            margin-bottom: 20px;

            box-shadow:
                0 4px 15px
                rgba(0, 0, 0, 0.10);
        }

        h1 {
            margin-top: 0;
        }

        .botoes {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        button {
            border: none;
            padding: 13px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 15px;
            font-weight: bold;
        }

        button:hover {
            opacity: 0.85;
        }

        .atualizar {
            background: #2196f3;
            color: white;
        }

        .limpar {
            background: #e53935;
            color: white;
        }

        .tabela-container {
            background: white;
            border-radius: 18px;
            padding: 20px;
            overflow-x: auto;

            box-shadow:
                0 4px 15px
                rgba(0, 0, 0, 0.10);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 850px;
        }

        th {
            background: #222;
            color: white;
            padding: 13px;
            text-align: center;
        }

        td {
            padding: 12px;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }

        tr:hover {
            background: #f5f5f5;
        }

        .quantidade {
            font-size: 18px;
            font-weight: bold;
        }

    </style>

</head>

<body>

<div class="container">

    <div class="cabecalho">

        <h1>
            🗑️ Lixeira Inteligente
        </h1>

        <p>
            Painel de histórico das
            leituras da lixeira.
        </p>

        <p class="quantidade">
            Total de leituras:
            ${resultado.rows.length}
        </p>

        <div class="botoes">

            <button
                class="atualizar"
                onclick="location.reload()"
            >
                🔄 Atualizar
            </button>

            <button
                class="limpar"
                onclick="limparHistorico()"
            >
                🗑️ Limpar histórico
            </button>

        </div>

    </div>

    <div class="tabela-container">

        <table>

            <thead>

                <tr>

                    <th>ID</th>

                    <th>
                        Nível
                    </th>

                    <th>
                        Distância interna
                    </th>

                    <th>
                        Distância externa
                    </th>

                    <th>
                        Tampa
                    </th>

                    <th>
                        Coleta
                    </th>

                    <th>
                        Data/Hora
                    </th>

                </tr>

            </thead>

            <tbody>

                ${linhas}

            </tbody>

        </table>

    </div>

</div>

<script>

async function limparHistorico() {

    const confirmar = confirm(
        "Tem certeza que deseja apagar todo o histórico?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            "/api/leituras",
            {
                method: "DELETE"
            }
        );

        const dados = await resposta.json();

        if (resposta.ok) {

            alert(dados.mensagem);

            location.reload();

        } else {

            alert(
                "Erro ao limpar histórico."
            );

        }

    } catch (erro) {

        alert(
            "Não foi possível conectar com a API."
        );

        console.log(erro);

    }

}

</script>

</body>

</html>
        `);

    } catch (erro) {

        console.log(
            "Erro ao carregar painel:"
        );

        console.log(
            erro.message
        );

        res.status(500).send(
            "Erro ao carregar painel."
        );
    }
});

// ==========================================
// SALVAR LEITURA
// ==========================================

app.post(
    "/api/leituras",
    async (req, res) => {

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
                VALUES
                ($1, $2, $3, $4, $5)
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
                mensagem:
                    "Leitura salva com sucesso!",

                id:
                    resultado.rows[0].id
            });

        } catch (erro) {

            console.log(
                "Erro ao salvar leitura:"
            );

            console.log(
                erro.message
            );

            res.status(500).json({
                erro:
                    "Erro ao salvar leitura"
            });
        }
    }
);

// ==========================================
// BUSCAR LEITURAS
// ==========================================

app.get(
    "/api/leituras",
    async (req, res) => {

        try {

            const resultado = await pool.query(`
                SELECT
                    id,
                    nivel,
                    distancia_interna,
                    distancia_externa,
                    tampa,
                    coleta_solicitada,
                    TO_CHAR(
                        data_hora AT TIME ZONE 'America/Sao_Paulo',
                        'DD/MM/YYYY, HH24:MI:SS'
                    ) AS data_hora
                FROM leituras
                ORDER BY id DESC
            `);

            res.json(resultado.rows);

        } catch (erro) {

            console.log(
                "Erro ao buscar leituras:"
            );

            console.log(
                erro.message
            );

            res.status(500).json({
                erro:
                    "Erro ao buscar leitura"
            });
        }
    }
);

// ==========================================
// LIMPAR HISTÓRICO
// ==========================================

app.delete(
    "/api/leituras",
    async (req, res) => {

        try {

            await pool.query(
                "TRUNCATE TABLE leituras RESTART IDENTITY"
            );

            res.json({
                mensagem:
                    "Histórico apagado com sucesso!"
            });

        } catch (erro) {

            console.log(
                "Erro ao limpar histórico:"
            );

            console.log(
                erro.message
            );

            res.status(500).json({
                erro:
                    "Erro ao limpar histórico"
            });
        }
    }
);

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            `API rodando na porta ${PORT}`
        );

    }
);