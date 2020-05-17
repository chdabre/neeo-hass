'use strict';

const neeoapi = require('neeo-sdk');
const CONSTANTS = require('./constants');

module.exports = class SwitchController {
  constructor(homeAssistant) {
    this.homeAssistant = homeAssistant;

    this.switchHandlers = {
      getter: (deviceId) => this.switchGet(deviceId),
      setter: (deviceId, params) => this.switchSet(deviceId, params),
    };
  }

  static build(homeAssistant) {
    return new SwitchController(homeAssistant);
  }

  switchSet(deviceid, value) {
    console.log('[CONTROLLER] switch set to', deviceid, value);
    return this.homeAssistant.services.call(value ? 'turn_on' : 'turn_off', 'switch', deviceid)
  }

  async switchGet(deviceid) {
    console.log('[CONTROLLER] return switch value', deviceid, true);
    const switchState = this.homeAssistant.states.get('switch', deviceid)
    return switchState.state === 'on'
  }

  buildSwitchDevice(name) {
    return neeoapi.buildDevice(CONSTANTS.UNIQUE_DEVICE_NAME)
      .setSpecificName(name || 'Home Assistant Switch')
      .setManufacturer('Home Assistant')
      .setType('light')
      .addCapability('dynamicDevice')
      .addSwitch(
        CONSTANTS.POWER_SWITCH,
        this.switchHandlers
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
              device: this.buildSwitchDevice(device.attributes.friendly_name),
            };
          });
      });
  }

  async discovery(entityId) {
    return (await this.homeAssistant.states.list()).filter(state => state.entity_id.startsWith('switch'));
  }
};
