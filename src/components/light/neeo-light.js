'use strict';

const neeoapi = require('neeo-sdk');
const CONSTANTS = require('./constants');

module.exports = class LightController {
  constructor(homeAssistant) {
    this.homeAssistant = homeAssistant;

    this.brightnessHandlers = {
      getter: (deviceId) => this.brightnessGet(deviceId),
      setter: (deviceId, params) => this.brightnessSet(deviceId, params),
    };

    this.switchHandlers = {
      getter: (deviceId) => this.switchGet(deviceId),
      setter: (deviceId, params) => this.switchSet(deviceId, params),
    };
  }

  static build(homeAssistant) {
    return new LightController(homeAssistant);
  }

  brightnessSet(deviceid, value) {
    console.log('[CONTROLLER] brightness set to', deviceid, value);

    if (value === 0) {
      return this.homeAssistant.services.call('turn_off', 'light', {
        entity_id: deviceid,
      })
    } else {
      return this.homeAssistant.services.call('turn_on', 'light', {
        entity_id: deviceid,
        brightness_pct: value
      })
    }
  }

  brightnessGet(deviceid) {
    console.log('[CONTROLLER] brightness get for', deviceid);

    return this.homeAssistant.states.get('light', deviceid)
      .then(lightState => {
        return Promise.resolve(lightState.state === 'off' ? 0 : ((lightState.attributes.brightness / 256) * 100))
      })
  }

  switchSet(deviceid, value) {
    console.log('[CONTROLLER] switch set to', deviceid, value);
    return this.homeAssistant.services.call(value ? 'turn_on' : 'turn_off', 'light', deviceid)
  }

  async switchGet(deviceid) {
    const lightState = await this.homeAssistant.states.get('light', deviceid)
    console.log('[CONTROLLER] return switch value', deviceid, lightState.state === 'on');
    return lightState.state === 'on'
  }

  buildLightDevice(name) {
    return neeoapi.buildDevice(CONSTANTS.UNIQUE_DEVICE_NAME)
      .setSpecificName(name || 'Home Assistant Light')
      .setManufacturer('Home Assistant')
      .setType('light')
      .addCapability('dynamicDevice')
      .addSwitch(
        CONSTANTS.POWER_SWITCH,
        this.switchHandlers
      )
      .addSlider(
        CONSTANTS.DIMMER,
        this.brightnessHandlers
      );
  }

  discoverDevices(entityId) {
    console.log('[CONTROLLER] discovery call', entityId);
    return this.discovery(entityId)
      .then((discoveryResults) => {
        return discoveryResults
          .map((device) => {
            return {
              id: device.entity_id,
              name: device.attributes.friendly_name,
              reachable: true,
              device: this.buildLightDevice(device.attributes.friendly_name),
            };
          });
      });
  }

  async discovery(entityId) {
    return (await this.homeAssistant.states.list()).filter(state => state.entity_id.startsWith('light'));
  }
};
