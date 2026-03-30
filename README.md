# JHAN-IA API

![JHAN-IA Logo](https://mi-api-clnb.onrender.com/img.jpg)

**JHAN-IA API** te permite integrar un asistente inteligente en tus proyectos usando tu propia API Key.

---

## 🔹 Requisitos e Instalación

1. Tener **Node.js** (v16+) en tu proyecto.  
2. Instalar dependencias necesarias si tu proyecto es Node.js:

```bash
npm install express cors node-fetch uuid

## 🔑 Configuración de tu API Key

```bash
1 Consigue tu API Key desde la API (por ejemplo: (xxxx.xxxx-xxxxxx).
Guarda tu API Key 
(xxxx.xxxx-xxxxxx)

 el URL de la API en tu proyecto:
"https://mi-api-clnb.onrender.com/api/ia" (siempre va a ser ese URL)
 
Ejemplo 

```bash
const API_URL = "https://mi-api-clnb.onrender.com/api/ia";
const API_KEY = "TU_API_KEY";
const USUARIO = "nombre_usuario";