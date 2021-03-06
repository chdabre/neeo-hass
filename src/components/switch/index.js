const neeoapi = require('neeo-sdk');

const CONSTANTS = require('./constants');
const GLOBAL_CONSTANTS = require('../constants');
const SwitchController = require('./neeo-switch')

const initDriver = (homeAssistant) => {
  return buildDevice(SwitchController.build(homeAssistant));
}

const buildDevice = (controller) => {
  return neeoapi.buildDevice(CONSTANTS.UNIQUE_DEVICE_NAME)
    .setManufacturer('Home Assistant')
    .setType('light')
    .addAdditionalSearchToken('hass')
    .enableDiscovery(
      // Here we enable the dynamic device builder, so the discovery function must return
      // build neeo devices too - see discovery function
      {
        headerText: GLOBAL_CONSTANTS.DISCOVER_HEADER_TEXT + ' Switch',
        description: GLOBAL_CONSTANTS.DISCOVER_DESCRIPTION,
        enableDynamicDeviceBuilder: true,
      },
      // this function returns the discovered devices
      (optionalDeviceId) => controller.discoverDevices(optionalDeviceId)
    );
}

module.exports = initDriver
