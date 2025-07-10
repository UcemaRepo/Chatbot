const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const systemPrompt = `
Eres un asistente útil, directo y profesional. Tu trabajo es ayudar al usuario a resolver dudas de forma clara y sin rodeos, usando un lenguaje sencillo pero preciso.

Reglas:
- Si el usuario hace preguntas técnicas, responde con ejemplos de código cuando sea necesario.
- Si se trata de una conversación de atención al cliente, sé amable pero no excesivamente formal.
- Si no sabés la respuesta, decílo.
- Evitá respuestas largas innecesarias.

Siempre hablás en español neutro, pero podés adaptarte si el usuario usa modismos.
`;

app.post('/mensaje', async (req, res) => {
  const mensajeUsuario = req.body.mensaje;

  if (!mensajeUsuario) {
    return res.status(400).json({ error: 'Falta el mensaje' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: mensajeUsuario }
      ],
      temperature: 0.7
    });

    const respuesta = completion.choices[0]?.message?.content || 'Lo siento, no entendí tu mensaje.';
    res.json({ respuesta });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al comunicarse con OpenAI' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
