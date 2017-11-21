const storage = require('node-persist');
const DMX = require('dmx');

class DMXControl {
    constructor() {

    }

    get storage() {
        if (!this._storage) {
            storage.initSync();
            this._storage = storage;
            this._storage.get = storage.getItemSync;
            this._storage.set = storage.setItemSync;
        }

        return this._storage;
    }

    get universe() {
        if (!this._universe) {
            this._universe = this.dmx.addUniverse('dmx', 'enttec-usb-dmx-pro', '/dev/cu.usbserial-EN223883');
        }

        return this._universe;
    }

    get dmx() {
        if (!this._dmx) {
            this._dmx = new DMX();
        }

        return this._dmx;
    }

    get universedata() {
        if (!this._universe) {
            this.universe;
        }

        this._universedata = this.dmx.universes['dmx'].universe;
        return [...this._universedata];
    }

    set universedata(value) {
        this.dmx.universes['dmx'].universe = value;
    }
}

global.dmxcon = new DMXControl();