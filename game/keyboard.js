var Keyboard = {
    typing: false,
    backspace: false,
    typingText: []
};

Keyboard.LEFT = 37;
Keyboard.RIGHT = 39;
Keyboard.UP = 38;
Keyboard.DOWN = 40;
Keyboard.A = 65;
Keyboard.D = 68;
Keyboard.E = 69;

Keyboard._keys = {};

Keyboard.listenForEvents = function (keys) {
    window.addEventListener('keydown', this._onKeyDown.bind(this));
    window.addEventListener('keyup', this._onKeyUp.bind(this));
    window.addEventListener('keypress', this._onKeyPress.bind(this));

    keys.forEach(function (key) {
        this._keys[key] = false;
    }.bind(this));
}

Keyboard.update = function (delta) { };

Keyboard._onKeyDown = function (event) {
    var keyCode = event.keyCode;
    if (this.typing) {
        if (keyCode === 8) {
            this.backspace = true;
            this._onKeyPress(event);
        }
    }
    else if (keyCode in this._keys) {
        event.preventDefault();
        this._keys[keyCode] = true;
    }
};

Keyboard._onKeyPress = function (event) {
    var keyCode = event.keyCode;
    if (keyCode == 13) {
        if (this.typing) {
            this.typingText = [];
        }
        this.typing = !this.typing;
    }
    else if (this.typing) {
        const valid =
            keyCode === 8
            || keyCode === 32
            || (keyCode > 47 && keyCode < 58) // number keys
            || (keyCode > 64 && keyCode < 91 || keyCode > 96 && keyCode < 123);  // [AZ-az]
        //|| (keyCode > 95 && keyCode < 112)  // numpad keys
        //|| (keyCode > 185 && keyCode < 193)  // ;=,-./` (in order)
        //|| (keyCode > 218 && keyCode < 223) // [\]' (in order)
        if (valid) {
            event.preventDefault();
            if (this.backspace) {
                this.typingText = this.typingText.slice(0, Math.max(0, this.typingText.length - 1));
                this.backspace = false;
            } else if (this.typingText.length < 80) {
                this.typingText.push(keyCode);
            }
        }
    }
}

Keyboard._onKeyUp = function (event) {
    var keyCode = event.keyCode;
    if (keyCode in this._keys) {
        event.preventDefault();
        this._keys[keyCode] = false;
    }
};

Keyboard.isDown = function (keyCode) {
    if (!keyCode in this._keys) {
        throw new Error('Keycode ' + keyCode + ' is not being listened to');
    }
    return this._keys[keyCode];
};