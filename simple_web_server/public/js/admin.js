$(function () {
    let socket = io.connect({
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
    });
    socket.once('connect', () => {
        socket.on('serverResponse', function (data) {
            $(".consoleHistory").append(data + "<br>");
            updateScroll();
        });

        socket.on('disconnect', function (reason) {
            console.log('disconnected from server');
        });

        $('.consoleInput').on('submit', function (e) {
            e.preventDefault(); // prevents page reloading
            socket.emit('consoleInput', $(".consoleInput input").val());
            $('.consoleInput input').val('');
            return false;
        });

    });
});

function updateScroll() {
    let d = $(".consoleHistoryWrapper");
    d.scrollTop(d.prop("scrollHeight"));
}