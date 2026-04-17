/**
 * Garment Price Configuration (in INR)
 * Hardcoded for MVP — easily extensible.
 * To add a new garment, just add a key-value pair below.
 */
const GARMENT_PRICES = {
  SHIRT: 30,
  PANTS: 40,
  SAREE: 80,
  SUIT: 150,
  JACKET: 120,
  KURTA: 50,
  DRESS: 70,
  BED_SHEET: 60,
};

/** Valid garment type keys */
const VALID_GARMENT_TYPES = Object.keys(GARMENT_PRICES);

/** Valid order statuses */
const ORDER_STATUSES = ['RECEIVED', 'PROCESSING', 'READY', 'DELIVERED'];

/**
 * Allowed forward-only status transitions.
 * Key = current status, Value = array of allowed next statuses.
 */
const STATUS_TRANSITIONS = {
  RECEIVED: ['PROCESSING'],
  PROCESSING: ['READY'],
  READY: ['DELIVERED'],
  DELIVERED: [],
};

module.exports = {
  GARMENT_PRICES,
  VALID_GARMENT_TYPES,
  ORDER_STATUSES,
  STATUS_TRANSITIONS,
};
