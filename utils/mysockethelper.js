var mySocketHelper = {
    io: null,
    startSockets: (ioFromApp) => {
        this.io = ioFromApp;
        ioFromApp.on('connection', function (socket) {
            console.log('connected');
        });
    },

    sendMessgae: (msg) => {
        if (msg == "vacationsChange") {
            this.io.emit('vacationsChange', msg);
            console.log('vacationsChange');
        }
    }
}

module.exports = mySocketHelper;