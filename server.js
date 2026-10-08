```javascript
const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

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
// CRIAR TABELA
// ==========================================

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

// ==========================================
// ROTA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {
    res.send("API da Lixeira Inteligente funcionando!");
});

// ==========================================
// PÁGINA DE LEITURAS
// ==========================================

app.get("/api/leituras", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT *
            FROM leituras
            ORDER BY id DESC
        `);

        const leituras = resultado.rows;

        // ==========================================
        // ÚLTIMA LEITURA
        // ==========================================

        const ultimaLeitura = leituras[0];

        const nivelAtual = ultimaLeitura
            ? ultimaLeitura.nivel
            : 0;

        const tampaAtual = ultimaLeitura
            ? ultimaLeitura.tampa
            : "SEM DADOS";

        const coletaAtual = ultimaLeitura
            ? ultimaLeitura.coleta_solicitada
            : false;

        // ==========================================
        // STATUS DO NÍVEL
        // ==========================================

        let textoNivel = "Nível normal";
        let corNivel = "verde";

        if (nivelAtual >= 60) {
            textoNivel = "Necessita de coleta";
            corNivel = "vermelho";
        } else if (nivelAtual >= 40) {
            textoNivel = "Atenção ao nível";
            corNivel = "amarelo";
        }

        // ==========================================
        // GERAR TABELA
        // ==========================================

        let linhas = "";

        leituras.forEach((leitura) => {

            const statusColeta = leitura.coleta_solicitada
                ? "🚛 Coleta solicitada"
                : "✓ Normal";

            const classeColeta = leitura.coleta_solicitada
                ? "alerta"
                : "normal";

            const classeTampa = leitura.tampa === "ABERTA"
                ? "aberta"
                : "fechada";

            let classeNivelTabela = "baixo";

            if (leitura.nivel >= 60) {
                classeNivelTabela = "alto";
            } else if (leitura.nivel >= 40) {
                classeNivelTabela = "medio";
            }

            linhas += `
                <tr>

                    <td>
                        <span class="id">
                            #${leitura.id}
                        </span>
                    </td>

                    <td>
                        <div class="nivel-info">

                            <strong>
                                ${leitura.nivel}%
                            </strong>

                            <div class="mini-barra">
                                <div
                                    class="mini-progresso ${classeNivelTabela}"
                                    style="width: ${leitura.nivel}%">
                                </div>
                            </div>

                        </div>
                    </td>

                    <td>
                        <strong>
                            ${Number(leitura.distancia_interna).toFixed(1)}
                        </strong>
                        cm
                    </td>

                    <td>
                        <strong>
                            ${Number(leitura.distancia_externa).toFixed(1)}
                        </strong>
                        cm
                    </td>

                    <td>
                        <span class="badge ${classeTampa}">
                            ${leitura.tampa === "ABERTA" ? "↑" : "↓"}
                            ${leitura.tampa}
                        </span>
                    </td>

                    <td>
                        <span class="badge ${classeColeta}">
                            ${statusColeta}
                        </span>
                    </td>

                    <td class="data">
                        ${new Date(leitura.data_hora).toLocaleString("pt-BR")}
                    </td>

                </tr>
            `;
        });

        // ==========================================
        // HTML
        // ==========================================

        const html = `

<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<meta http-equiv="refresh" content="10">

<title>Lixeira Inteligente</title>

<style>

/* ==========================================
   RESET
========================================== */

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f3f6f8;
    color: #1f2937;
}

/* ==========================================
   CABEÇALHO
========================================== */

header {
    background: linear-gradient(135deg, #111827, #263548);
    color: white;
    padding: 32px 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.header {
    max-width: 1200px;
    margin: auto;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 15px;
}

.logo-icon {
    width: 60px;
    height: 60px;

    background: white;
    border-radius: 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 32px;
}

.logo h1 {
    margin: 0;
    font-size: 28px;
}

.logo p {
    margin: 6px 0 0;
    color: #cbd5e1;
    font-size: 14px;
}

.atualizacao {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);

    padding: 10px 15px;
    border-radius: 10px;

    font-size: 13px;
}

/* ==========================================
   CONTAINER
========================================== */

.container {
    max-width: 1200px;
    margin: 35px auto;
    padding: 0 20px;
}

/* ==========================================
   CARDS
========================================== */

.cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;

    margin-bottom: 25px;
}

.card {
    background: white;

    border-radius: 18px;

    padding: 22px;

    border: 1px solid #e5e7eb;

    box-shadow:
        0 4px 18px rgba(15, 23, 42, 0.07);

    position: relative;
    overflow: hidden;
}

.card::before {
    content: "";

    position: absolute;

    left: 0;
    top: 0;

    width: 5px;
    height: 100%;

    background: #2563eb;
}

.card.verde::before {
    background: #16a34a;
}

.card.amarelo::before {
    background: #eab308;
}

.card.vermelho::before {
    background: #dc2626;
}

.card-topo {
    display: flex;

    align-items: center;
    justify-content: space-between;

    margin-bottom: 12px;
}

.card-titulo {
    color: #64748b;

    font-size: 12px;

    font-weight: bold;

    text-transform: uppercase;
}

.card-icone {
    font-size: 24px;
}

.card-valor {
    font-size: 27px;

    font-weight: bold;

    color: #111827;
}

.card-sub {
    margin-top: 6px;

    color: #64748b;

    font-size: 12px;
}

/* ==========================================
   NÍVEL
========================================== */

.nivel-card {
    background: white;

    border-radius: 18px;

    padding: 25px;

    margin-bottom: 25px;

    border: 1px solid #e5e7eb;

    box-shadow:
        0 4px 18px rgba(15, 23, 42, 0.07);
}

.nivel-topo {
    display: flex;

    align-items: center;
    justify-content: space-between;

    margin-bottom: 18px;
}

.nivel-topo h2 {
    margin: 0;

    font-size: 20px;
}

.status {
    font-weight: bold;

    font-size: 14px;
}

.status.verde {
    color: #16a34a;
}

.status.amarelo {
    color: #ca8a04;
}

.status.vermelho {
    color: #dc2626;
}

.barra {
    width: 100%;

    height: 24px;

    background: #e5e7eb;

    border-radius: 50px;

    overflow: hidden;
}

.progresso {
    height: 100%;

    width: ${nivelAtual}%;

    border-radius: 50px;

    background:
        ${corNivel === "vermelho"
            ? "#dc2626"
            : corNivel === "amarelo"
                ? "#eab308"
                : "#16a34a"
        };

    transition: width 0.5s;
}

.nivel-footer {
    display: flex;

    justify-content: space-between;

    margin-top: 10px;

    color: #64748b;

    font-size: 12px;
}

/* ==========================================
   TABELA
========================================== */

.tabela-card {
    background: white;

    border-radius: 18px;

    padding: 25px;

    border: 1px solid #e5e7eb;

    box-shadow:
        0 4px 18px rgba(15, 23, 42, 0.07);
}

.tabela-topo {
    display: flex;

    align-items: center;
    justify-content: space-between;

    margin-bottom: 20px;
}

.tabela-topo h2 {
    margin: 0;

    font-size: 20px;
}

.tabela-topo p {
    margin: 5px 0 0;

    color: #64748b;

    font-size: 13px;
}

.total {
    background: #f1f5f9;

    padding: 8px 12px;

    border-radius: 10px;

    font-size: 12px;

    font-weight: bold;

    color: #475569;
}

.tabela {
    overflow-x: auto;
}

table {
    width: 100%;

    min-width: 950px;

    border-collapse: collapse;
}

thead {
    background: #f8fafc;
}

th {
    padding: 14px 12px;

    text-align: left;

    font-size: 11px;

    color: #64748b;

    text-transform: uppercase;

    border-bottom: 1px solid #e2e8f0;
}

td {
    padding: 16px 12px;

    font-size: 13px;

    color: #475569;

    border-bottom: 1px solid #eef2f7;
}

tbody tr:hover {
    background: #f8fafc;
}

/* ==========================================
   ID
========================================== */

.id {
    background: #f1f5f9;

    color: #475569;

    padding: 6px 9px;

    border-radius: 8px;

    font-weight: bold;

    font-size: 11px;
}

/* ==========================================
   BARRA PEQUENA
========================================== */

.nivel-info {
    min-width: 90px;
}

.mini-barra {
    width: 75px;

    height: 5px;

    background: #e5e7eb;

    border-radius: 10px;

    overflow: hidden;

    margin-top: 6px;
}

.mini-progresso {
    height: 100%;

    border-radius: 10px;
}

.mini-progresso.baixo {
    background: #16a34a;
}

.mini-progresso.medio {
    background: #eab308;
}

.mini-progresso.alto {
    background: #dc2626;
}

/* ==========================================
   BADGES
========================================== */

.badge {
    display: inline-flex;

    align-items: center;

    padding: 6px 10px;

    border-radius: 20px;

    font-size: 11px;

    font-weight: bold;

    white-space: nowrap;
}

.badge.normal {
    background: #dcfce7;

    color: #15803d;
}

.badge.alerta {
    background: #fee2e2;

    color: #b91c1c;
}

.badge.aberta {
    background: #dbeafe;

    color: #1d4ed8;
}

.badge.fechada {
    background: #f1f5f9;

    color: #475569;
}

.data {
    white-space: nowrap;

    color: #64748b;
}

/* ==========================================
   SEM DADOS
========================================== */

.vazio {
    text-align: center;

    padding: 60px 20px;

    color: #64748b;
}

.vazio-icon {
    font-size: 45px;

    margin-bottom: 10px;
}

/* ==========================================
   RODAPÉ
========================================== */

footer {
    text-align: center;

    padding: 30px;

    color: #94a3b8;

    font-size: 12px;
}

/* ==========================================
   RESPONSIVO
========================================== */

@media (max-width: 1000px) {

    .cards {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 650px) {

    .header {
        flex-direction: column;

        align-items: flex-start;
    }

    .atualizacao {
        width: 100%;

        text-align: center;
    }

    .container {
        padding: 0 12px;

        margin-top: 20px;
    }

    .cards {
        grid-template-columns: 1fr;
    }

    .nivel-topo {
        flex-direction: column;

        align-items: flex-start;

        gap: 8px;
    }

    .tabela-card,
    .nivel-card {
        padding: 18px;
    }
}

</style>

</head>

<body>

<header>

    <div class="header">

        <div class="logo">

            <div class="logo-icon">
                🗑️
            </div>

            <div>

                <h1>
                    Lixeira Inteligente
                </h1>

                <p>
                    Sistema de monitoramento IoT
                </p>

            </div>

        </div>

        <div class="atualizacao">
            🔄 Atualização automática a cada 10 segundos
        </div>

    </div>

</header>

<div class="container">

    <!-- ======================================
         CARDS
    ======================================= -->

    <div class="cards">

        <!-- NÍVEL -->

        <div class="card ${corNivel}">

            <div class="card-topo">

                <span class="card-titulo">
                    Nível atual
                </span>

                <span class="card-icone">
                    📊
                </span>

            </div>

            <div class="card-valor">
                ${nivelAtual}%
            </div>

            <div class="card-sub">
                ${textoNivel}
            </div>

        </div>

        <!-- TAMPA -->

        <div class="card">

            <div class="card-topo">

                <span class="card-titulo">
                    Tampa
                </span>

                <span class="card-icone">
                    🗑️
                </span>

            </div>

            <div class="card-valor" style="font-size: 22px;">
                ${tampaAtual}
            </div>

            <div class="card-sub">
                Estado atual da tampa
            </div>

        </div>

        <!-- COLETA -->

        <div class="card ${coletaAtual ? "vermelho" : "verde"}">

            <div class="card-topo">

                <span class="card-titulo">
                    Coleta
                </span>

                <span class="card-icone">
                    🚛
                </span>

            </div>

            <div class="card-valor" style="font-size: 20px;">

                ${coletaAtual
                    ? "SOLICITADA"
                    : "NORMAL"
                }

            </div>

            <div class="card-sub">

                ${coletaAtual
                    ? "Atenção necessária"
                    : "Tudo funcionando"
                }

            </div>

        </div>

        <!-- TOTAL -->

        <div class="card">

            <div class="card-topo">

                <span class="card-titulo">
                    Leituras
                </span>

                <span class="card-icone">
                    📋
                </span>

            </div>

            <div class="card-valor">
                ${leituras.length}
            </div>

            <div class="card-sub">
                Registros no banco
            </div>

        </div>

    </div>

    <!-- ======================================
         NÍVEL DA LIXEIRA
    ======================================= -->

    <div class="nivel-card">

        <div class="nivel-topo">

            <h2>
                📈 Nível da lixeira
            </h2>

            <span class="status ${corNivel}">

                ${nivelAtual >= 60
                    ? "🔴 Necessita de coleta"
                    : nivelAtual >= 40
                        ? "🟡 Atenção ao nível"
                        : "🟢 Nível normal"
                }

            </span>

        </div>

        <div class="barra">

            <div class="progresso"></div>

        </div>

        <div class="nivel-footer">

            <span>
                0% - Vazia
            </span>

            <strong>
                ${nivelAtual}%
            </strong>

            <span>
                100% - Cheia
            </span>

        </div>

    </div>

    <!-- ======================================
         HISTÓRICO
    ======================================= -->

    <div class="tabela-card">

        <div class="tabela-topo">

            <div>

                <h2>
                    📋 Histórico de leituras
                </h2>

                <p>
                    Dados recebidos pelo ESP32
                </p>

            </div>

            <div class="total">
                ${leituras.length} registro(s)
            </div>

        </div>

        ${
            linhas
                ? `
                    <div class="tabela">

                        <table>

                            <thead>

                                <tr>

                                    <th>ID</th>

                                    <th>Nível</th>

                                    <th>Dist. interna</th>

                                    <th>Dist. externa</th>

                                    <th>Tampa</th>

                                    <th>Coleta</th>

                                    <th>Data / Hora</th>

                                </tr>

                            </thead>

                            <tbody>

                                ${linhas}

                            </tbody>

                        </table>

                    </div>
                `
                : `
                    <div class="vazio">

                        <div class="vazio-icon">
                            📭
                        </div>

                        <strong>
                            Nenhuma leitura registrada
                        </strong>

                        <p>
                            Quando o ESP32 enviar dados,
                            eles aparecerão aqui.
                        </p>

                    </div>
                `
        }

    </div>

</div>

<footer>

    🗑️ Lixeira Inteligente
    •
    Sistema IoT de monitoramento

</footer>

</body>

</html>
        `;

        res.send(html);

    } catch (erro) {

        console.log("Erro ao buscar leituras:");
        console.log(erro.message);

        res.status(500).send(`
            <h1>Erro ao carregar leituras</h1>
            <p>${erro.message}</p>
        `);
    }
});

// ==========================================
// POST - RECEBER LEITURA DO ESP32
// ==========================================

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

// ==========================================
// INICIAR BANCO
// ==========================================

iniciarBanco();

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(3000, () => {

    console.log("API rodando na porta 3000");

});
```
