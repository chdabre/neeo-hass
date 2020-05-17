"use strict";

const neeoapi = require("neeo-sdk");
const driver = require("./hass-driver");

// IP of your NEEO Brain
const BRAIN_IP = process.env.NEEO_IP;

neeoapi
  .startServer({
    brain: BRAIN_IP,
    port: process.env.NEEO_PORT || 6336,
    name: 'debug-server',
    devices: [
      ...driver.devices,
    ]
  })
  .then(() => console.log('Server Ready'))
  .catch((error) => {
    console.error('ERROR:', error);
    process.exit(1);
  });
