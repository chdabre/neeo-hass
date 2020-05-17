'use strict';

const HomeAssistant = require('homeassistant');

const NeeoSwitch = require('./components/switch')
const NeeoLight = require('./components/light')

const hass = new HomeAssistant({
  host: process.env.HASS_HOST || 'http://127.0.0.1',
  port: process.env.HASS_PORT || 8123,
  token: process.env.HASS_TOKEN
});

module.exports = {
  devices: [
    NeeoSwitch(hass),
    NeeoLight(hass)
  ],
};
