$(function () {
    let socket = io();
    socket.on('connect', () => {
        socket.emit("greetings", Cookies.get('userId'), Cookies.get('username'));

        // handle the event sent with socket.send()
        socket.on('message', function (data) {
            $("#Robert").html("Message reçu : " + data)
        });

    });
    
    socket.on('disconnect', function (reason) {
        if (reason === 'io server disconnect') {
            $("#Robert").html("Message reçu : " + "Deconnection, server stopped");
            socket.connect();
        }
    });
    /** Tableau sélectionnable
     var isMouseDown = false, isHighlighted;
     $("#our_table td")
     .mousedown(function () {
         isMouseDown = true;
            $(this).toggleClass("highlighted");
            isHighlighted = $(this).hasClass("highlighted");
            return false; // prevent text selection
        })
        .mouseover(function () {
            if (isMouseDown) {
                $(this).toggleClass("highlighted", isHighlighted);
            }
        })
        .bind("selectstart", function () {
            return false;
        })
        
        $(document).mouseup(function () {
            isMouseDown = false;
        });
     */
});