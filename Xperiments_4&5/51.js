const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// ------------------------------
// In-Memory Data Model
// ------------------------------
const decks = {};
const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Utility functions
function makeStandardDeck() {
  const cards = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      const code = `${r}${s[0]}`; // e.g., "AH", "10D"
      cards.push({ code, suit: s, rank: r });
    }
  }
  return cards;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ------------------------------
// Deck Routes
// ------------------------------

// Create a new deck
app.post('/decks', (req, res) => {
  const { id, name, type, cards } = req.body;
  if (!id) return res.status(400).json({ error: 'Deck ID required' });
  if (decks[id]) return res.status(409).json({ error: 'Deck ID already exists' });

  decks[id] = {
    id,
    name: name || `Deck ${id}`,
    cards: type === 'standard' || !type ? makeStandardDeck() : Array.isArray(cards) ? cards : []
  };
  res.status(201).json(decks[id]);
});

// Get deck info
app.get('/decks/:id', (req, res) => {
  const deck = decks[req.params.id];
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json(deck);
});

// List all decks
app.get('/decks', (req, res) => {
  const list = Object.values(decks).map(d => ({ id: d.id, name: d.name, totalCards: d.cards.length }));
  res.json(list);
});

// Delete a deck
app.delete('/decks/:id', (req, res) => {
  if (!decks[req.params.id]) return res.status(404).json({ error: 'Deck not found' });
  delete decks[req.params.id];
  res.json({ message: 'Deck deleted' });
});

// Shuffle a deck
app.post('/decks/:id/shuffle', (req, res) => {
  const deck = decks[req.params.id];
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  shuffleArray(deck.cards);
  res.json({ message: 'Deck shuffled', total: deck.cards.length });
});

// Reset deck
app.post('/decks/:id/reset', (req, res) => {
  const deck = decks[req.params.id];
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  deck.cards = makeStandardDeck();
  res.json({ message: 'Deck reset to 52 standard cards', total: deck.cards.length });
});

// ------------------------------
// Card Routes
// ------------------------------

// Get cards with pagination
app.get('/decks/:id/cards', (req, res) => {
  const deck = decks[req.params.id];
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const { offset = 0, limit = 52 } = req.query;
  const start = parseInt(offset);
  const end = start + parseInt(limit);

  res.json({ total: deck.cards.length, cards: deck.cards.slice(start, end) });
});

// Add a card to deck
app.post('/decks/:id/cards', (req, res) => {
  const deck = decks[req.params.id];
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const card = req.body.card;
  if (!card || !card.code) return res.status(400).json({ error: 'Card object with code required' });

  if (deck.cards.find(c => c.code === card.code))
    return res.status(409).json({ error: 'Card already exists in deck' });

  deck.cards.push(card);
  res.status(201).json({ message: 'Card added', card });
});

// Remove a card by code
app.delete('/decks/:id/cards/:code', (req, res) => {
  const deck = decks[req.params.id];
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const idx = deck.cards.findIndex(c => c.code === req.params.code);
  if (idx === -1) return res.status(404).json({ error: 'Card not found' });

  const removed = deck.cards.splice(idx, 1)[0];
  res.json({ message: 'Card removed', removed });
});

// Draw cards from deck
app.post('/decks/:id/draw', (req, res) => {
  const deck = decks[req.params.id];
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  let { count = 1 } = req.body;
  count = parseInt(count);
  if (isNaN(count) || count <= 0)
    return res.status(400).json({ error: 'Count must be a positive integer' });

  const drawn = deck.cards.splice(0, count);
  res.json({ drawn, remaining: deck.cards.length });
});

// ------------------------------
// Seed Example Deck
// ------------------------------
decks['default'] = { id: 'default', name: 'Default Deck', cards: makeStandardDeck() };

// ------------------------------
// Start Server
// ------------------------------
app.listen(PORT, () => {
  console.log(`🎴 Card Collection API running at http://localhost:${PORT}`);
});
