# 🗑️ Lixeira Inteligente IoT

Projeto de **Internet das Coisas (IoT)** desenvolvido para o curso técnico em **Desenvolvimento de Sistemas - SENAI**.

A Lixeira Inteligente utiliza um **ESP32-S2** para controlar a tampa automaticamente, monitorar o nível de preenchimento e enviar os dados pela internet para uma API. As informações são armazenadas em um banco de dados PostgreSQL e disponibilizadas em um painel de histórico online.

---

## 📌 Sobre o Projeto

O projeto foi desenvolvido e simulado utilizando o **Wokwi**.

O sistema possui dois sensores ultrassônicos:

* **Sensor externo:** detecta a aproximação de uma pessoa e controla a abertura da tampa.
* **Sensor interno:** mede a distância até os resíduos para calcular o nível de preenchimento.

Quando o nível da lixeira chega a **60% ou mais**, o sistema indica que uma coleta é necessária.

Além do funcionamento local no ESP32, os dados são enviados para uma API hospedada na nuvem, permitindo armazenar e consultar o histórico das leituras.

---

## ⚙️ Funcionamento

O sistema funciona da seguinte forma:

1. O sensor externo detecta uma pessoa próxima à lixeira.
2. O ESP32-S2 aciona o servo motor e abre a tampa.
3. Quando a pessoa se afasta, a tampa é fechada.
4. O sensor interno mede o nível de preenchimento.
5. O ESP32 calcula o percentual de ocupação.
6. Quando o nível chega a **60%**, a coleta é solicitada.
7. Os LEDs indicam o estado da lixeira:

   * 🟢 **Verde:** nível abaixo de 60%.
   * 🔴 **Vermelho:** nível igual ou superior a 60%.
8. Os dados são enviados pela internet para a API.
9. A API armazena as informações no PostgreSQL.
10. Os dados podem ser consultados no histórico online.

---

## 🔌 Componentes

* ESP32-S2
* 2 sensores ultrassônicos HC-SR04
* Servo motor
* LED verde
* LED vermelho
* Resistores
* Wi-Fi
* Wokwi

---

## 📍 Ligações

| Componente          | GPIO ESP32-S2 |
| ------------------- | ------------: |
| Sensor externo TRIG |        GPIO 4 |
| Sensor externo ECHO |        GPIO 5 |
| Servo motor         |        GPIO 6 |
| LED verde           |        GPIO 7 |
| LED vermelho        |        GPIO 8 |
| Sensor interno TRIG |        GPIO 9 |
| Sensor interno ECHO |       GPIO 10 |
| HC-SR04 VCC         |            5V |
| HC-SR04 GND         |           GND |
| Servo VCC           |            5V |
| Servo GND           |           GND |

---

## ☁️ Integração com a Nuvem

O projeto possui uma integração real com a nuvem.

A comunicação funciona através da seguinte arquitetura:

```text
ESP32-S2
    ↓
Wi-Fi
    ↓
API Node.js + Express
    ↓
Render
    ↓
PostgreSQL
    ↓
Histórico Online
```

O ESP32 envia os dados para a API utilizando **requisições HTTP POST**.

A API recebe as informações e registra cada leitura no banco de dados PostgreSQL.

---

## 📊 Dados Armazenados

O sistema registra:

* Nível de preenchimento;
* Distância interna;
* Distância externa;
* Estado da tampa;
* Necessidade de coleta;
* Data e hora da leitura.

Esses dados podem ser consultados posteriormente através do histórico online.

---

## 🌐 Sistema Online

### Painel e Histórico

https://lixeira-api.onrender.com/

### API

https://lixeira-api.onrender.com/api/leituras

---

## 🖥️ Backend

O backend foi desenvolvido utilizando:

* **Node.js**
* **Express**
* **PostgreSQL**
* **Render**

O arquivo principal da API é:

```text
server.js
```

A API possui funções para:

* receber novas leituras;
* armazenar os dados no PostgreSQL;
* consultar o histórico;
* exibir os registros no painel;
* excluir o histórico armazenado.

---

## 📁 Estrutura do Repositório

```text
lixeira-api/
│
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
│
├── lixeira_automatica - Wokwi ESP32, STM32, Arduino Simulator.html
```

### Principais arquivos

**`server.js`**
Código da API Node.js/Express e integração com o PostgreSQL.

**`package.json`**
Define as dependências e configurações do projeto Node.js.

**`package-lock.json`**
Registra as versões das dependências utilizadas.

**`lixeira_automatica - Wokwi ESP32, STM32, Arduino Simulator.html`**
Arquivo relacionado à simulação da Lixeira Inteligente no Wokwi.

**`PROTOTIPAGEM.zip`**
Arquivos relacionados à prototipagem do projeto.

**`lixeira_api.zip`**
Cópia dos arquivos da API.

---

## 🛠️ Tecnologias Utilizadas

### Hardware e Simulação

* ESP32-S2
* HC-SR04
* Servo motor
* Wokwi

### Programação

* C++
* Arduino
* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Banco de Dados

* PostgreSQL

### Cloud

* Render

### Versionamento

* Git
* GitHub

---

## 📚 Bibliotecas do ESP32

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
```

Principais funções:

* **Arduino.h:** recursos básicos do ESP32;
* **WiFi.h:** conexão com a rede Wi-Fi;
* **WebServer.h:** criação do servidor web embarcado;
* **HTTPClient.h:** envio das requisições HTTP;
* **WiFiClientSecure.h:** comunicação segura com a API.

---

## 🎯 Objetivo

O objetivo do projeto é desenvolver uma solução IoT capaz de:

* automatizar a abertura e fechamento da lixeira;
* monitorar seu nível de preenchimento;
* identificar a necessidade de coleta;
* enviar os dados pela internet;
* armazenar as informações na nuvem;
* disponibilizar um histórico das leituras.

Dessa forma, o projeto demonstra a integração entre **IoT, programação embarcada, desenvolvimento de APIs, banco de dados e computação em nuvem**.

---

## 🎓 Projeto Acadêmico

**Curso:** Técnico em Desenvolvimento de Sistemas - SENAI
**Projeto:** Lixeira Inteligente IoT
**Simulação:** Wokwi
**Backend:** Node.js + Express
**Banco de dados:** PostgreSQL
**Cloud:** Render
**Versionamento:** GitHub
